from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bookings import router as bookings_router
import shutil, os
from rag import get_answer
from intent import classify_intent, extract_booking_entities
from ingest import ingest_pdf

app = FastAPI()
app.include_router(bookings_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"

@app.post("/chat")
async def chat(req: ChatRequest):
    intent = classify_intent(req.message)

    if intent == "unclear":
        return {
            "type": "unclear",
            "content": "Hi! I'm CSIS SmartAssist. I can answer questions about department policies or help you book a lab or room. How can I help?"
        }

    if intent == "booking":
        entities = extract_booking_entities(req.message)
        missing = [k for k, v in entities.items() if v is None]

        if missing:
            return {
                "type": "clarification",
                "content": f"I'd love to help you book! Could you also provide: {', '.join(missing)}?"
            }

        return {
            "type": "booking",
            "content": "I found the following details for your booking:",
            "booking": {
                "resource": entities["resource"],
                "date": entities["date"],
                "time": entities["time"],
                "duration": entities["duration"]
            }
        }

    result = get_answer(req.message)
    return {
        "type": "answer",
        "content": result["answer"],
        "source": result["source"]
    }

@app.post("/documents")
async def upload_document(file: UploadFile = File(...)):
    os.makedirs("docs", exist_ok=True)
    filepath = f"docs/{file.filename}"
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    ingest_pdf(filepath, file.filename)
    return {"status": "indexed", "filename": file.filename}

@app.get("/health")
def health():
    return {"status": "ok"}