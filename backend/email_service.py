import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
ADMIN_EMAIL = os.getenv("GMAIL_USER")

def send_email(to: str, subject: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = GMAIL_USER
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to, msg.as_string())
    print(f"Email sent to {to}")

def send_admin_approval_email(booking_id: str, requester: str, resource: str, date: str, time: str, duration: str):
    approve_link = f"{BASE_URL}/bookings/{booking_id}/action?status=approved"
    reject_link = f"{BASE_URL}/bookings/{booking_id}/action?status=rejected"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1F4E79; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">CSIS SmartAssist</h1>
            <p style="color: #D6E4F0; margin: 5px 0;">New Booking Request</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #1F4E79;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold;">Requester:</td><td style="padding: 8px;">{requester}</td></tr>
                <tr style="background:#eee;"><td style="padding: 8px; font-weight: bold;">Resource:</td><td style="padding: 8px;">{resource}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td style="padding: 8px;">{date}</td></tr>
                <tr style="background:#eee;"><td style="padding: 8px; font-weight: bold;">Time:</td><td style="padding: 8px;">{time}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Duration:</td><td style="padding: 8px;">{duration}</td></tr>
            </table>
            <div style="margin-top: 30px; text-align: center;">
                <a href="{approve_link}" style="background:#22c55e;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;margin-right:15px;font-weight:bold;">✓ Approve</a>
                <a href="{reject_link}" style="background:#ef4444;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:bold;">✗ Reject</a>
            </div>
        </div>
    </div>
    """
    send_email(ADMIN_EMAIL, f"[CSIS] Booking Request: {resource} on {date}", html)

def send_user_notification(to: str, status: str, resource: str, date: str, remarks: str = None):
    color = "#22c55e" if status == "approved" else "#ef4444"
    label = "Approved ✓" if status == "approved" else "Rejected ✗"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1F4E79; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">CSIS SmartAssist</h1>
        </div>
        <div style="padding: 30px;">
            <div style="background:{color};color:white;padding:15px;border-radius:8px;text-align:center;font-size:20px;font-weight:bold;margin-bottom:20px;">
                Booking {label}
            </div>
            <p>Your booking for <strong>{resource}</strong> on <strong>{date}</strong> has been <strong>{status}</strong>.</p>
            {f'<p><strong>Remarks:</strong> {remarks}</p>' if remarks else ''}
        </div>
    </div>
    """
    send_email(to, f"[CSIS] Booking {label}: {resource}", html)