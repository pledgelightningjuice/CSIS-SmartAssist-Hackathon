from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

# Temporary in-memory store until Person 2 sets up MongoDB
bookings = []

class BookingConfirm(BaseModel):
    user_id: str
    booking: dict

class BookingStatus(BaseModel):
    status: str  # "approved" or "rejected"

@router.post("/bookings/confirm")
async def confirm_booking(req: BookingConfirm):
    booking_id = f"booking_{len(bookings) + 1}"
    new_booking = {
        "booking_id": booking_id,
        "user_id": req.user_id,
        "resource": req.booking.get("resource"),
        "date": req.booking.get("date"),
        "time": req.booking.get("time"),
        "duration": req.booking.get("duration"),
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    bookings.append(new_booking)
    return {"booking_id": booking_id, "status": "pending"}

@router.get("/bookings")
async def get_bookings(user_id: Optional[str] = None):
    if user_id:
        return [b for b in bookings if b["user_id"] == user_id]
    return bookings

@router.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str, req: BookingStatus):
    for b in bookings:
        if b["booking_id"] == booking_id:
            b["status"] = req.status
            return {"success": True}
    return {"success": False, "error": "Booking not found"}