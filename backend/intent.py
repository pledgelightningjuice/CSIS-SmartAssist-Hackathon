from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="llama3")

def classify_intent(message: str) -> str:
    prompt = f"""Classify this message as exactly one of: QUESTION, BOOKING, or UNCLEAR.

QUESTION = asking for information, policies, procedures, deadlines, how something works
BOOKING = requesting to book or reserve a room, lab, resource, or equipment
UNCLEAR = greetings, random text, gibberish, anything that doesn't fit the above two

Message: "{message}"

Reply with only one word — QUESTION, BOOKING, or UNCLEAR:"""
    
    result = llm.invoke(prompt).strip().upper()
    if "BOOKING" in result:
        return "booking"
    if "QUESTION" in result:
        return "question"
    return "unclear"
