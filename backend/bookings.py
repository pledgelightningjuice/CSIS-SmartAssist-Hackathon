from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
from database import (
    create_booking, get_bookings_by_user, get_all_bookings,
    get_booking_by_id, update_booking_status,
    create_announcement, get_announcements
)
from email_service import send_admin_approval_email, send_user_notification

router = APIRouter()

class BookingConfirm(BaseModel):
    user_id: str
    requester: str
    resource: str
    date: str
    time: str
    duration: str

class StatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = ""

class AnnouncementCreate(BaseModel):
    content: str
    posted_by: str = "Admin"

@router.post("/bookings/confirm")
def confirm_booking(req: BookingConfirm):
    booking_id = create_booking(
        req.user_id, req.requester,
        req.resource, req.date, req.time, req.duration
    )
    send_admin_approval_email(
        booking_id, req.requester,
        req.resource, req.date, req.time, req.duration
    )
    return {"booking_id": booking_id, "status": "pending"}

@router.get("/bookings")
def list_bookings(user_id: str = None):
    if user_id:
        return get_bookings_by_user(user_id)
    return get_all_bookings()

@router.patch("/bookings/{booking_id}")
def update_booking(booking_id: str, req: StatusUpdate):
    update_booking_status(booking_id, req.status, req.remarks)
    return {"success": True}

# One-click approve/reject from email link
@router.get("/bookings/{booking_id}/action")
def action_booking(booking_id: str, status: str):
    booking = get_booking_by_id(booking_id)
    if not booking:
        return HTMLResponse("<h2>Booking not found.</h2>")

    update_booking_status(booking_id, status)
    send_user_notification(
        booking["user_id"], status,
        booking["resource"], booking["date"]
    )

    color = "#22c55e" if status == "approved" else "#ef4444"
    icon = "✓" if status == "approved" else "✗"
    label = "Approved" if status == "approved" else "Rejected"

    return HTMLResponse(f"""
    <html>
    <body style="font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5;">
        <div style="text-align:center;background:white;padding:50px;border-radius:12px;box-shadow:0 2px 20px rgba(0,0,0,0.1);">
            <div style="font-size:60px;">{icon}</div>
            <h1 style="color:{color};">Booking {label}</h1>
            <p style="color:#666;">The requester has been notified automatically.</p>
            <p style="color:#888;font-size:14px;">{booking['resource']} | {booking['date']} | {booking['time']}</p>
        </div>
    </body>
    </html>
    """)

@router.post("/announcements")
def post_announcement(req: AnnouncementCreate):
    ann_id = create_announcement(req.content, req.posted_by)
    return {"id": ann_id}

@router.get("/announcements")
def list_announcements():
    return get_announcements()