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
                          backed by facts, logic, and evidence. You also dismantle your opponent's arguments using facts and logic.
                          You are currently serving the court as a lawyer, and will be conversing with another lawyer, who is your opponent.""")
        ]
        self.evidence = evidence
        
    def study_case(self, case:str, evidence:List[List]):
        """Help the lawyer study the case.

        Args:
            case (str): The main details of the case being discussed.
            evidence (List[str]): List of evidence found at the scene. 
                                    Should be of form (type,description)
        """
        # change behavior based on if they are attacking or defending
        self.messages += [
            SystemMessage(content="This is the case being discussed:\n" + case + "\n"),
        ]
        self.evidence = evidence
                
    def respond(self, strategy, typ="response", response:str=None):
        if response: self.messages.append(HumanMessage(content=response))
        
        match typ:
            case "opener":
                prompt = self.messages + [
                    SystemMessage(f"Generate an opening statement from the prosecution's perspective using this strategy:{strategy}. Limit output to 60 words or less.")
                ]
                response = self.model.invoke(prompt).content
                return response
                
            case "response":
                response = self.model.invoke(self.messages).content
                
                # 2. Check all pieces of evidence if any support the argument
                for type, description in self.evidence:
                    tmp = [
                        SystemMessage(content=f"""Can the following piece of evidence be used to fortify this response? 
                                            response:{response}
                                            evidence:{type} evidence, {description}  
                                            
                                            Start your response with "YES" or "NO".
                                    """)
                    ]
                    can_be_used = True
                    tmp_res = self.model.invoke(tmp).content
                    for denial in ['no', 'No', 'NO']:
                        if denial in tmp_res:
                            can_be_used = False
                            break
                    
                    if can_be_used:
                        incorporate_template = [
                            SystemMessage(f"""Incorporate this evidence into the argument. 
                                                evidence: {type} evidence, {description}
                                                argument: {response}
                                                
                                                Include ONLY the update argument in your response.
                                          """)
                        ]
                        # 3. Incorporate evidence into argument.
                        response = self.model.invoke(incorporate_template).content
                
                summarized = self.model.invoke([SystemMessage(content="Summarize the following to 60 words or less:" + response)]).content
                       
                # 4. Verify it is from a lawyer perspective
                verify_perspective_template = [
                    SystemMessage(content="Change this response so that it is from the viewpoint of a lawyer who is currently in court."),
                    HumanMessage(content=summarized)
                ]
                response = self.model.invoke(verify_perspective_template).content
                       
                return response 
                
            case "closer":
                pass
            
    def get_arg_history(self):
        return self.messages[1:] # skip instruction message
    