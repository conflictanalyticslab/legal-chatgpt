import streamlit as st
from lawyer import Lawyer
from judge import Judge
from player_filler import PlayerGenerator
from stylable_container import stylable_container

# Trial data
from data.emp import test_trial
from data.immi import trial1
from data.l_and_t import trial2

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
st.set_page_config(page_title="Lawyer-Off!", page_icon="⚖️", layout="wide")

st.title("Ace Attorney")
st.markdown("""Not actual certified legal advice""")

num_args = 1 # default number of arguments both sides get to take

# from court_process import court_process
# with st.sidebar:
#     st.markdown("💡 **Tip:** You can collapse this sidebar by clicking the arrow in the top-right corner of the sidebar.")
#     st.markdown(court_process)

if "cur_section" not in st.session_state:
    st.session_state.cur_section = 0 # 0 - Opener, 1 - Debate, 2 - Closer, 3 - Judgement & Feedback

col1, col2 = st.columns([0.5,1])

with col1:
    # Selection component
    option = st.selectbox("",
        ("Employment", "Landlord & Tenant", "Immigration")
    )
    print("User chose area:", option)

with col2:
    # Focus on employment law, Landlord & Tenant law, or Immigration Law
    match option:
        case "Employment":
            with st.expander("Case Info", expanded=True):
                # Indexing matters a lot in markdown.
                popup_string = f"""### {test_trial["case"]}

{test_trial["description"]}   
                            
### EVIDENCE:
"""
                for category, description in test_trial['evidence']:
                    popup_string += f"- {category} evidence: {description}\n"
                st.markdown(popup_string)

if option:
    lawyer, judge, player = Lawyer(defending=True), Judge(), PlayerGenerator(evidence=test_trial["evidence"])
    
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

    # Custom CSS to adjust the layout
    st.markdown(
        """
        <style>
        .stChatBox {
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 10px;
            margin: 10px 0;
        }
        .stSelectbox {
            margin-bottom: 10px;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(f'<div class="faded-separator">--- Opening Statements ---</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="faded-separator"> Hint: Prosecution Goes First! </div>', unsafe_allow_html=True)

    # Create two columns for the chat windows
    col1, middle, col2 = st.columns([1, 1, 1])
    
    # session state
    if "human_history" not in st.session_state:
        st.session_state.human_history = [HumanMessage(content="Click on one of the options on the right to get started!")]
    if "cpu_history" not in st.session_state:
        st.session_state.cpu_history = [AIMessage(content="Beep Boop. Ready to Law Out.")]

    # First Chat Window (Left)
    with col1:
        st.markdown("### HUMAN")
        for message in st.session_state.human_history[:1]:    
            with st.chat_message("Human"):
                st.write(message.content)
                
    if "selected_option" not in st.session_state:
        st.session_state.selected_option = ""

    with middle:
        options = [
            "Appeal to Emotion.",
            "Use Facts and Logic.",
            "Get Confrontational.",
            "Tell a Story."
        ]
        for choice in options:
            # Assume users will only pick one
            if st.button(label=choice, key=choice):
                print(st.session_state.selected_option)
                st.session_state.selected_option = choice

                yap = player.respond(strategy=st.session_state.selected_option, typ="opener")
                print(yap)
                st.session_state.human_history[0] = HumanMessage(content=yap)
                
                response = lawyer.respond(typ="opener")
                st.session_state.cpu_history[0]=(AIMessage(content=response))
                
                if len(st.session_state.human_history) >= 1:
                    st.session_state.cur_section = 1
                elif len(st.session_state.human_history) >= 1 + num_args:
                    st.session_state.cur_section = 2
                elif len(st.session_state.human_history) >= 1 + num_args + 1:
                    st.session_state.cur_section = 3 # Judgement & Feedback
                
                print(len(st.session_state.human_history), st.session_state.cur_section)
                st.rerun()
                
                
                
                

    # Second Chat Window (Right)
    

    with col2:
        # Selection Window on Top of the Second Chat Box
        st.markdown("### CPU")
        
        for message in st.session_state.cpu_history[:1]:    
            with st.chat_message("AI"):
                st.write(message.content)
                
    if st.session_state.cur_section > 0: 
        st.markdown(f'<div class="faded-separator">--- Presentation of Evidence and Testimony ---</div>', unsafe_allow_html=True)
        st.markdown(f'<div class="faded-separator"> You each will have {num_args} chances to state your points. </div>', unsafe_allow_html=True)


        if len(st.session_state.human_history[1:2+num_args]) < 2:
            col1, middle, col2 = st.columns([1, 2, 1])
            # session state
            with col1:
                st.markdown("### HUMAN")
                with st.chat_message("Human"):
                        st.write("Choose an argument strategy.")
            
            with middle:
                options = [
                    "Appeal to Emotion.",
                    "Use Facts and Logic.",
                    "Get Confrontational.",
                    "Tell a Story."
                ]
                for choice in options:
                    # Assume users will only pick one
                    if st.button(label=choice, key=choice + "1"):
                        print(st.session_state.selected_option)
                        st.session_state.selected_option = choice

                        yap = player.respond(strategy=st.session_state.selected_option, typ="response")
                        print(yap)
                        st.session_state.human_history.append(HumanMessage(content=yap))
                        
                        response = lawyer.respond(typ="response")
                        st.session_state.cpu_history.append(AIMessage(content=response))
                        
                        if len(st.session_state.human_history) >= 1:
                            st.session_state.cur_section = 1
                        elif len(st.session_state.human_history) >= 1 + num_args:
                            st.session_state.cur_section = 2
                        elif len(st.session_state.human_history) >= 1 + num_args + 1:
                            st.session_state.cur_section = 3 # Judgement & Feedback
                        
                        print(len(st.session_state.human_history), len(st.session_state.cpu_history), st.session_state.cur_section)
                        st.rerun()
                        

            # Second Chat Window (Right)
            with col2:
                # Selection Window on Top of the Second Chat Box
                st.markdown("### CPU")

                with st.chat_message("AI"):
                        st.write("Beep Boop. Prepare yourself.")
        else:
            for i in range(len(st.session_state.human_history[1:2+num_args])):
                hm, cm = st.session_state.human_history[i], st.session_state.cpu_history[i] 
                col1, middle, col2 = st.columns([1, 2, 1])

                # session state
                with col1:
                    st.markdown("### HUMAN")
                    with st.chat_message("Human"):
                        st.write(hm.content)
                                
                        
            st.session_state.selected_option = ""

            with middle:
                options = [
                    "Appeal to Emotion.",
                    "Use Facts and Logic.",
                    "Get Confrontational.",
                    "Tell a Story."
                ]
                for choice in options:
                    # Assume users will only pick one
                    if st.button(label=choice, key=choice + "1"):
                        print(st.session_state.selected_option)
                        st.session_state.selected_option = choice

                        yap = player.respond(strategy=st.session_state.selected_option, typ="response")
                        print(yap)
                        st.session_state.human_history.append(HumanMessage(content=yap))
                        
                        response = lawyer.respond(typ="response")
                        st.session_state.cpu_history.append(AIMessage(content=response))
                        
                        if len(st.session_state.human_history) >= 1:
                            st.session_state.cur_section = 1
                        elif len(st.session_state.human_history) >= 1 + num_args:
                            st.session_state.cur_section = 2
                        elif len(st.session_state.human_history) >= 1 + num_args + 1:
                            st.session_state.cur_section = 3 # Judgement & Feedback
                        
                        print(len(st.session_state.human_history), len(st.session_state.cpu_history), st.session_state.cur_section)
                        st.rerun()
                        

            # Second Chat Window (Right)
            with col2:
                # Selection Window on Top of the Second Chat Box
                st.markdown("### CPU")               
                with st.chat_message("AI"):
                    st.write(cm.content)


# for message in st.session_state.chat_history[:2]: # All openers
#     if isinstance(message, AIMessage):
#         with st.chat_message("AI"):
#             st.write(message.content)
#     elif isinstance(message, HumanMessage):
#         with st.chat_message("Human"):
#             st.write(message.content)

# if cur_section > 0: 
#     st.markdown(f'<div class="faded-separator">--- Presentation of Evidence and Testimony ---</div>', unsafe_allow_html=True)
#     st.markdown(f'<div class="faded-separator"> You each will have {num_args} chances to state your points. </div>', unsafe_allow_html=True)
#     for message in st.session_state.chat_history[2:2+num_args*2]: # All arguments
#         if isinstance(message, AIMessage):
#             with st.chat_message("AI"):
#                 st.write(message.content)
#         elif isinstance(message, HumanMessage):
#             with st.chat_message("Human"):
#                 st.write(message.content)

# if cur_section > 1:
#     st.markdown(f'<div class="faded-separator">--- Closing Statements ---</div>', unsafe_allow_html=True)
#     for message in st.session_state.chat_history[2+num_args*2:2+num_args*2+2]: # All closers
#         if isinstance(message, AIMessage):
#             with st.chat_message("AI"):
#                 st.write(message.content)
#         elif isinstance(message, HumanMessage):
#             with st.chat_message("Human"):
#                 st.write(message.content)

# if cur_section > 2:
#     st.markdown(f'<div class="faded-separator">--- Judgement & Reflection ---</div>', unsafe_allow_html=True)
#     for message in st.session_state.chat_history[2+num_args*2+2:]: # Feedback
#         if isinstance(message, AIMessage):
#             with st.chat_message("AI"):
#                 st.write(message.content)
#         elif isinstance(message, HumanMessage):
#             with st.chat_message("Human"):
#                 st.write(message.content)
#         else: # Judge message
#             with st.chat_message("Human", avatar="👨‍⚖️"):
#                 st.write(message.content)

# # user input
# match cur_section:
#     case 0:
#         message = "Enter your opening statement here..."
#     case 1:
#         message = "Enter your argument here..."
#     case 2:
#         message = "Enter your closing statement here..."
#     case 3:
#         message = "Ask for feedback here..."

# user_query = st.chat_input(message)
# if user_query is not None and user_query != "":
#     st.session_state.chat_history.append(HumanMessage(content=user_query))

#     with st.chat_message("Human"):
#         st.markdown(user_query)

#     with st.chat_message("AI"):
#         match cur_section:
#             case 0:
#                 response = lawyer.respond(typ="opener", response=user_query)
#             case 1:
#                 response = lawyer.respond(typ="response", response=user_query)
#             case 2:
#                 response = lawyer.respond(typ="closer", response=user_query)
#             case 3:
#                 response = judge.respond(convo=st.session_state.chat_history, query=user_query)
#         st.write(response)

#     st.session_state.chat_history.append(AIMessage(content=response) if cur_section < 2 else JudgeMessage(content=response))
#     print(len(st.session_state.chat_history), cur_section)
    
#     if len(st.session_state.chat_history) == 2 + 2*num_args + 2:
#         # Now swap to judge.
#         print("Now judging the court.")
#         response = judge.judge_conversation(convo=st.session_state.chat_history)
#         st.session_state.chat_history.append(JudgeMessage(content=response))
    
#         # TODO: Also determine the winner
    
#     st.rerun()
    
    # if len(st.session_state.chat_history) >= 2:
    #     cur_section = 1
    # elif len(st.session_state.chat_history) >= 2 + 2*num_args:
    #     cur_section = 2
    # elif len(st.session_state.chat_history) >= 2 + 2*num_args + 2:
    #     cur_section = 3 # Judgement & Feedback