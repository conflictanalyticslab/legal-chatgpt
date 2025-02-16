# https://python.langchain.com/docs/tutorials/llm_chain/

import getpass
import os
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from typing import List

class PlayerGenerator:
    
    def __init__(self, evidence=[]):
        
        if not os.environ.get("OPENAI_API_KEY"):
            os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")
        self.model = init_chat_model("gpt-4o-mini", model_provider="openai")
        self.messages = [
            SystemMessage(content="""You are the most capable prosecutor in history. You are never wrong. You always win court cases using strong, persuasive arguments 
                          backed by facts, logic, and evidence.""")
        ]
        self.evidence = evidence
    
                
    def respond(self, case, query):
        messages = self.messages + [
            SystemMessage(content=f"Use this case to answer the following user query:\n{case}\n"),
            HumanMessage(content=query)
        ]
        
        response = self.model.invoke(messages).content                
        summarized = self.model.invoke([SystemMessage(content="Summarize the following to 60 words or less:" + response)]).content
                       
        # 4. Verify it is from a lawyer perspective
        verify_perspective_template = [
            SystemMessage(content="Change this response so that it is from the viewpoint of a lawyer who is currently in court."),
            HumanMessage(content=summarized)
        ]
        response = self.model.invoke(verify_perspective_template).content
                
        return response
            
    def get_arg_history(self):
        return self.messages[1:] # skip instruction message
    