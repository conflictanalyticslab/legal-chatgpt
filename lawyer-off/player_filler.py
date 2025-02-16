# https://python.langchain.com/docs/tutorials/llm_chain/

import getpass
import os
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from typing import List

class PlayerGenerator:
    
    def __init__(self):
        
        if not os.environ.get("OPENAI_API_KEY"):
            os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")
        self.model = init_chat_model("gpt-4o-mini", model_provider="openai")
        self.messages = [
            SystemMessage(content="""You are a legal intake who will listen to a client's complaints about legal issues. Ask them a question
                          related to the legal situation to narrow down issues and facts, and cannot be answered using Yes/No. Keep total response below 60.""")
        ]
        self.pity = [SystemMessage(content="""You are a legal intake who will listen to a client's complaints.
                                   Say something empathetic about the person's situation without being insensitive or demeaning.
                                   Keep total response below 30.""")]
                
    def respond(self, query):
        messages = self.messages + [
            HumanMessage(content=query)
        ]
        pity = self.pity+ [
            HumanMessage(content=query)
        ]
        response = self.model.invoke(pity).content + "\n" + self.model.invoke(messages).content
        
        return response
            
    def summarize(self, hist:List)->str:
        # hist is List of stuff
        convo = ""
        for msg in hist:
            if isinstance(msg, HumanMessage):
                convo += "User: " + msg.content + "\n"
            else:
                convo += "Advisor: " + msg.content + "\n"
        print("convo:", convo)
        
        summ = [
            AIMessage(content="Summarize the facts and issues presented by the client in point-form. DO NOT GIVE ADVICE."),
            HumanMessage(content=convo)
        ]
        response = self.model.invoke(summ).content
        return response
            
    def get_arg_history(self):
        return self.messages[1:] # skip instruction message
    
if __name__ == "__main__":
    x = PlayerGenerator()
    print(x.respond("My boyfriend is cheating on me and using our credit card to take another girl to dinner. What can I do?"))
    print(x.get_arg_history())