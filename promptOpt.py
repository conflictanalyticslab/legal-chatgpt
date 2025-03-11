from flask import Flask, jsonify, request
from dotenv import load_dotenv
import textgrad as tg
import os
import openai
import re
import numpy as np
import random
from sklearn.metrics.pairwise import cosine_similarity
import concurrent
from tqdm import tqdm
from datasets import load_dataset

# Load environment variables
load_dotenv(override=True)

api_key = os.getenv("OPENAI_API_KEY_TG")
# Initialize OpenAI client
client = openai.OpenAI(api_key=api_key)

def set_seed(seed):
    np.random.seed(seed)
    random.seed(seed)

# Initialize Flask
app = Flask(__name__)

# Define the function to clean text for easier comparison
def clean_text(text):
    text = text.lower().strip()  # Convert to lowercase
    text = re.sub(r'\s+', ' ', text)  # Remove extra spaces
    text = text.replace("according to the law,", "")  # Remove boilerplate phrases
    return text

# Function to get text embeddings
def get_embedding(text):
    text = clean_text(text)
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=[text]
    )
    return np.array(response.data[0].embedding).reshape(1, -1)

# Evaluation function using cosine similarity
def custom_evaluation_function(inputs):
    prediction = str(inputs["prediction"]).strip()
    ground_truth = str(inputs["ground_truth_answer"]).strip()
    
    try:
        pred_embedding = get_embedding(prediction)
        truth_embedding = get_embedding(ground_truth)
        similarity = cosine_similarity(pred_embedding, truth_embedding)[0][0]
        print(f"Similarity Score: {similarity:.3f} | Prediction: {prediction} | Truth: {ground_truth}")
        return tg.Variable(1 if similarity >= 0.60 else 0, requires_grad=False, role_description="evaluation score")
    except Exception as e:
        print(f"Error in embedding similarity: {e}")
        return tg.Variable(0, requires_grad=False, role_description="evaluation score")

# Load dataset
dataset = load_dataset("jonathanli/law_qa_eval")
train_set = [(item["instruction"], item["input"], item["output"]) for item in dataset["train"]]
test_set = [(item["instruction"], item["input"], item["output"]) for item in dataset["test"]]

# Set up models
set_seed(12)
llm_api_eval = tg.get_engine(engine_name="gpt-4o")
llm_api_test = tg.get_engine(engine_name="gpt-3.5-turbo")
tg.set_backward_engine(llm_api_eval, override=True)

STARTING_SYSTEM_PROMPT = (
    "1. The prompt should specify that the lawyer should provide general legal information and not specific legal advice."
    "2. It should emphasize the importance of clarifying jurisdictional differences when discussing laws from different regions."
    "3. The prompt should encourage the lawyer to suggest consulting a local attorney for jurisdiction-specific issues."
    "4. The language should be more formal and professional to reflect the role of a lawyer."
    "5. The prompt should include a reminder to maintain confidentiality and privacy in responses."
    "Please return the optimized prompt wrapped in <NEW_PROMPT> and </NEW_PROMPT> tags."
    "Example format: <NEW_PROMPT>Your optimized prompt here.</NEW_PROMPT>"
)

system_prompt = tg.Variable(STARTING_SYSTEM_PROMPT, requires_grad=True, role_description="system prompt")
model = tg.BlackboxLLM(llm_api_test, system_prompt)
optimizer = tg.TextualGradientDescent(engine=llm_api_eval, parameters=[system_prompt])

# Define Flask route to optimize the prompt
@app.route('/optimize-prompt', methods=['POST'])
def run_prompt_optimizer():
    # Assuming you are receiving a "system_prompt" JSON input from the frontend
    system_prompt_input = request.json["system_prompt"]
    system_prompt.set_value(system_prompt_input)  # Set the system prompt to the input value
    
    # Perform optimization
    optimizer.step()
    
    # Get the optimized prompt
    optimized_prompt = system_prompt.get_value()

    # Return the optimized prompt wrapped in <NEW_PROMPT> tags
    return jsonify({
        "optimized_prompt": f"<NEW_PROMPT>{optimized_prompt}</NEW_PROMPT>"
    })

# Define a route for evaluating the prediction
@app.route('/evaluate-prediction', methods=['POST'])
def evaluate_prediction():
    prediction = request.json["prediction"]
    ground_truth_answer = request.json["ground_truth_answer"]
    
    # Evaluate using the custom evaluation function
    result = custom_evaluation_function({
        "prediction": prediction,
        "ground_truth_answer": ground_truth_answer
    })
    
    # Return the similarity score in the response
    return jsonify({"similarity_score": result.value})

if __name__ == '__main__':
    app.run(debug=True)