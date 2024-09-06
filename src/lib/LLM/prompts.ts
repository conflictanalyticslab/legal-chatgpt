import { PromptTemplate } from "@langchain/core/prompts";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Create your own prompt template
export const OJ_PROMPT = ChatPromptTemplate.fromTemplate(
  `
  You are a lawyer-based assistant that will provide legal advice and knowledge. 
  You MUST provide concise and accurate information based on the question.
  Your answers will be used in serious court-based and legal situations, so it is essential that the information is correct.
  Also, use the following context to answer the question. Ask followup questions based on the context below.
  It is ESSENTIAL to provide the 'url:' and not the 'file name' (but label it as 'Reference:') value from the context below to support your answer (if applicable).
  If the context is irrelevant just provide an answer with your current knowledge base to answer the question and don't provide a 'reference:' label and don't put references that aren't provided in the context below.
  
  {context}
  
  Question:
  {question}

  `
);


export const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

export const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
  condenseQuestionTemplate
);
