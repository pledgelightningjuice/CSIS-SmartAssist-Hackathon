import chromadb
from datetime import datetime
import uuid

client = chromadb.PersistentClient(path="chroma_db")
bookings_col = client.get_or_create_collection("bookings")
announcements_col = client.get_or_create_collection("announcements")

def create_booking(user_id: str, requester: str, resource: str, date: str, time: str, duration: str) -> str:
    booking_id = str(uuid.uuid4())
    bookings_col.add(
        documents=[f"{requester} wants to book {resource} on {date} at {time} for {duration}"],
        metadatas=[{
            "user_id": user_id,
            "requester": requester,
            "resource": resource,
            "date": date,
            "time": time,
            "duration": duration,
            "status": "pending",
            "remarks": "",
            "created_at": datetime.utcnow().isoformat()
        }],
        ids=[booking_id]
    )
    return booking_id

def get_bookings_by_user(user_id: str) -> list:
    results = bookings_col.get(where={"user_id": user_id})
    return _format(results)

def get_all_bookings() -> list:
    results = bookings_col.get()
    return _format(results)

def get_booking_by_id(booking_id: str) -> dict | None:
    try:
        result = bookings_col.get(ids=[booking_id])
        if not result["ids"]:
            return None
        return {
            "id": result["ids"][0],
            **result["metadatas"][0]
        }
    except:
        return None

def update_booking_status(booking_id: str, status: str, remarks: str = ""):
    existing = get_booking_by_id(booking_id)
    if not existing:
        return
    # ChromaDB update requires re-adding with same id
    bookings_col.update(
        ids=[booking_id],
        metadatas=[{
            **{k: v for k, v in existing.items() if k != "id"},
            "status": status,
            "remarks": remarks,
            "updated_at": datetime.utcnow().isoformat()
        }]
    )

def _format(results: dict) -> list:
    output = []
    for i, booking_id in enumerate(results["ids"]):
        output.append({
            "id": booking_id,
            **results["metadatas"][i]
        })
    return output

# Announcements
def create_announcement(content: str, posted_by: str = "Admin") -> str:
    ann_id = str(uuid.uuid4())
    announcements_col.add(
        documents=[content],
        metadatas=[{
            "content": content,
            "posted_by": posted_by,
            "created_at": datetime.utcnow().isoformat()
        }],
        ids=[ann_id]
    )
    return ann_id

def get_announcements() -> list:
    results = announcements_col.get()
    output = []
    for i, ann_id in enumerate(results["ids"]):
        output.append({
            "id": ann_id,
            **results["metadatas"][i]
        })
    # Sort by created_at descending
    output.sort(key=lambda x: x["created_at"], reverse=True)
    return output