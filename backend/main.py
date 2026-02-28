from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bookings import router as bookings_router
import shutil, os
from rag import get_answer
from intent import classify_intent
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
            "content": "I can help you with department questions or room/lab bookings. Could you rephrase your message?"
        }

    if intent == "booking":
        return {
            "type": "booking",
            "content": "I understand you'd like to book a resource. Here are the available options for that date.",
            "booking": {
                "resource": "Meeting Room B",
                "date": "2026-02-26",
                "time": "2:00 PM",
                "duration": "2 hours"
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