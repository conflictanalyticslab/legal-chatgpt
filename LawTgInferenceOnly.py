import re
import concurrent
from dotenv import load_dotenv
from datasets import load_dataset
from tqdm import tqdm
import textgrad as tg
from textgrad.tasks import DataLoader
import numpy as np
import random
import openai
from sklearn.metrics.pairwise import cosine_similarity

# Load environment variables
load_dotenv(override=True)

# Initialize OpenAI client
client = openai.OpenAI()

def set_seed(seed):
    np.random.seed(seed)
    random.seed(seed)

# Clean text to allow for easier comparison
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

custom_evaluation_function.parse_output = lambda x: x

# Load dataset
dataset = load_dataset("jonathanli/law_qa_eval")
train_set = [(item["instruction"], item["input"], item["output"]) for item in dataset["train"]]
test_set = [(item["instruction"], item["input"], item["output"]) for item in dataset["test"]]

print("Training set length:", len(train_set))
print("Test set length:", len(test_set))

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

# Evaluation function
def eval_sample(item, eval_fn, model):
    instruction, question, correct_answer = item
    x = f"Instruction: {instruction}\nQuestion: {question}\nAnswer:"
    x_var = tg.Variable(x, requires_grad=False, role_description="query to the language model")
    y_var = tg.Variable(correct_answer, requires_grad=False, role_description="correct answer for the query")
    
    response = model(x_var)
    try:
        eval_output_variable = eval_fn(inputs=dict(prediction=response, ground_truth_answer=y_var))
        return int(eval_output_variable.value)
    except:
        eval_output_variable = eval_fn([x_var, y_var, response])
        eval_output_parsed = eval_fn.parse_output(eval_output_variable)
        return int(eval_output_parsed)

# Evaluate dataset
def eval_dataset(test_set, eval_fn, model, max_samples=None):
    if max_samples is None:
        max_samples = len(test_set)
    accuracy_list = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(eval_sample, sample, eval_fn, model) for sample in test_set[:max_samples]]
        tqdm_loader = tqdm(concurrent.futures.as_completed(futures), total=len(futures), position=0)
        for future in tqdm_loader:
            accuracy_list.append(future.result())
            tqdm_loader.set_description(f"Accuracy: {np.mean(accuracy_list):.3f}")
    return accuracy_list 

# Store results'''
results = {"test_acc": [], "prompt": [], "validation_acc": []}
results["test_acc"].append(eval_dataset(test_set, custom_evaluation_function, model))
results["prompt"].append(system_prompt.get_value())