from langchain_ollama import OllamaLLM
import json

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

def extract_booking_entities(message: str) -> dict:
    prompt = f"""Extract booking details from this message and return ONLY a JSON object.
If any field is missing or unclear, use null.

Message: "{message}"

Return exactly this JSON format:
{{
    "resource": "room or lab name or null",
    "date": "YYYY-MM-DD format or null",
    "time": "HH:MM AM/PM format or null",
    "duration": "X hours or null"
}}

Return ONLY the JSON, no other text:"""

    result = llm.invoke(prompt).strip()
    
    try:
        result = result.replace("```json", "").replace("```", "").strip()
        return json.loads(result)
    except:
        return {
            "resource": None,
            "date": None,
            "time": None,
            "duration": None
        }