import streamlit as st
from trials import test_trial
from lawyer import Lawyer
from judge import Judge

# streamlit run app.py
# To stop, open a tab and press CTRL + C

# BoilerPlate - Replace below with lawyer conversation
from langchain_core.messages import AIMessage, HumanMessage
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

class JudgeMessage:
    def __init__(self, content):
        self.content = content

# app config
st.set_page_config(page_title="Lawyer-Off!", page_icon="⚖️")
st.title("Lawyer-Off!")
st.markdown("""### How it works:
- Face-off against a CPU lawyer and prosecute an imaginary client
- Build your debate skills via mock trials
- Enjoy yourself and have fun!""")

num_args = 1 # default number of arguments both sides get to take

cur_section = 0 # 0 - Opener, 1 - Debate, 2 - Closer, 3 - Judgement & Feedback
if "chat_history" in st.session_state:
    if len(st.session_state.chat_history) < 2:
        cur_section = 0
    elif len(st.session_state.chat_history) < 2 + 2*num_args:
        cur_section = 1
    elif len(st.session_state.chat_history) < 2 + 2*num_args + 2:
        cur_section = 2
    else:
        cur_section = 3 # Judgement & Feedback


with st.expander("Case Info", expanded=True):
    # Indexing matters a lot in markdown.
    popup_string = f"""### {test_trial["case"]}

{test_trial["description"]}   
                
### EVIDENCE:
"""
    for category, description in test_trial['evidence']:
        popup_string += f"- {category} evidence: {description}\n"
    st.markdown(popup_string)
    
    
lawyer, judge = Lawyer(defending=True), Judge()

# session state
if "chat_history" not in st.session_state:
    lawyer.study_case(case=test_trial['description'], evidence=test_trial['evidence'])
    print("Studied!")
    
    st.session_state.chat_history = []

# Using "with" notation
from court_process import court_process
with st.sidebar:
    st.markdown("💡 **Tip:** You can collapse this sidebar by clicking the arrow in the top-right corner of the sidebar.")
    st.markdown(court_process)
    
# Custom CSS for the faded separator
st.markdown("""
<style>
.faded-separator {
    color: #888; /* Light gray color for faded text */
    font-style: italic;
    text-align: center;
    margin: 10px 0;
    opacity: 0.7; /* Faded effect */
}
</style>
""", unsafe_allow_html=True)

# conversation
st.markdown(f'<div class="faded-separator">--- Opening Statements ---</div>', unsafe_allow_html=True)
st.markdown(f'<div class="faded-separator"> Hint: Prosecution Goes First! </div>', unsafe_allow_html=True)
for message in st.session_state.chat_history[:2]: # All openers
    if isinstance(message, AIMessage):
        with st.chat_message("AI"):
            st.write(message.content)
    elif isinstance(message, HumanMessage):
        with st.chat_message("Human"):
            st.write(message.content)

if cur_section > 0: 
    st.markdown(f'<div class="faded-separator">--- Presentation of Evidence and Testimony ---</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="faded-separator"> You each will have {num_args} chances to state your points. </div>', unsafe_allow_html=True)
    for message in st.session_state.chat_history[2:2+num_args*2]: # All arguments
        if isinstance(message, AIMessage):
            with st.chat_message("AI"):
                st.write(message.content)
        elif isinstance(message, HumanMessage):
            with st.chat_message("Human"):
                st.write(message.content)

if cur_section > 1:
    st.markdown(f'<div class="faded-separator">--- Closing Statements ---</div>', unsafe_allow_html=True)
    for message in st.session_state.chat_history[2+num_args*2:2+num_args*2+2]: # All closers
        if isinstance(message, AIMessage):
            with st.chat_message("AI"):
                st.write(message.content)
        elif isinstance(message, HumanMessage):
            with st.chat_message("Human"):
                st.write(message.content)

if cur_section > 2:
    st.markdown(f'<div class="faded-separator">--- Judgement & Reflection ---</div>', unsafe_allow_html=True)
    for message in st.session_state.chat_history[2+num_args*2+2:]: # Feedback
        if isinstance(message, AIMessage):
            with st.chat_message("AI"):
                st.write(message.content)
        elif isinstance(message, HumanMessage):
            with st.chat_message("Human"):
                st.write(message.content)
        else: # Judge message
            with st.chat_message("Human", avatar="👨‍⚖️"):
                st.write(message.content)

# user input
match cur_section:
    case 0:
        message = "Enter your opening statement here..."
    case 1:
        message = "Enter your argument here..."
    case 2:
        message = "Enter your closing statement here..."
    case 3:
        message = "Ask for feedback here..."

user_query = st.chat_input(message)
if user_query is not None and user_query != "":
    st.session_state.chat_history.append(HumanMessage(content=user_query))

    with st.chat_message("Human"):
        st.markdown(user_query)

    with st.chat_message("AI"):
        match cur_section:
            case 0:
                response = lawyer.respond(typ="opener", response=user_query)
            case 1:
                response = lawyer.respond(typ="response", response=user_query)
            case 2:
                response = lawyer.respond(typ="closer", response=user_query)
            case 3:
                response = judge.respond(convo=st.session_state.chat_history, query=user_query)
        st.write(response)

    st.session_state.chat_history.append(AIMessage(content=response) if cur_section < 2 else JudgeMessage(content=response))
    print(len(st.session_state.chat_history), cur_section)
    
    if len(st.session_state.chat_history) == 2 + 2*num_args + 2:
        # Now swap to judge.
        print("Now judging the court.")
        response = judge.judge_conversation(convo=st.session_state.chat_history)
        st.session_state.chat_history.append(JudgeMessage(content=response))
    
        # TODO: Also determine the winner
    
    st.rerun()
    
    # if len(st.session_state.chat_history) >= 2:
    #     cur_section = 1
    # elif len(st.session_state.chat_history) >= 2 + 2*num_args:
    #     cur_section = 2
    # elif len(st.session_state.chat_history) >= 2 + 2*num_args + 2:
    #     cur_section = 3 # Judgement & Feedback