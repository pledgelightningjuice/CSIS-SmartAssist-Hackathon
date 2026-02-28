import os
import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_calendar_service():
    creds = None
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)
    
    return build("calendar", "v3", credentials=creds)

def check_availability(resource: str, date: str, time: str, duration_hours: int = 2) -> bool:
    try:
        service = get_calendar_service()
        
        # Parse date and time
        dt_str = f"{date} {time}"
        try:
            dt_start = datetime.datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
        except:
            dt_start = datetime.datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        
        dt_end = dt_start + datetime.timedelta(hours=duration_hours)
        
        # Check calendar for conflicts
        events_result = service.events().list(
            calendarId="primary",
            timeMin=dt_start.isoformat() + "Z",
            timeMax=dt_end.isoformat() + "Z",
            singleEvents=True,
            orderBy="startTime",
            q=resource  # search for resource name in events
        ).execute()
        
        events = events_result.get("items", [])
        return len(events) == 0  # True = available, False = conflict
    except Exception as e:
        print(f"Calendar check error: {e}")
        return True  # Default to available if calendar fails

def create_calendar_event(resource: str, requester: str, date: str, time: str, duration_hours: int = 2) -> str:
    try:
        service = get_calendar_service()
        
        dt_str = f"{date} {time}"
        try:
            dt_start = datetime.datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
        except:
            dt_start = datetime.datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        
        dt_end = dt_start + datetime.timedelta(hours=duration_hours)
        
        event = {
            "summary": f"[CSIS Booking] {resource} - {requester}",
            "description": f"Booked via CSIS SmartAssist by {requester}",
            "start": {
                "dateTime": dt_start.isoformat(),
                "timeZone": "Asia/Kolkata"
            },
            "end": {
                "dateTime": dt_end.isoformat(),
                "timeZone": "Asia/Kolkata"
            }
        }
        
        created_event = service.events().insert(
            calendarId="primary",
            body=event
        ).execute()
        
        return created_event.get("id", "")
    except Exception as e:
        print(f"Calendar event creation error: {e}")
        return ""
    
if __name__ == "__main__":
    service = get_calendar_service()
    print("Calendar connected!")
    
    # Test creating an event
    event_id = create_calendar_event(
        "Lab 3", "John Smith", "2026-02-28", "3:00 PM", 2
    )
    print("Event created with ID:", event_id)
    
    # Test checking availability
    available = check_availability("Lab 3", "2026-02-28", "3:00 PM", 2)
    print("Is available:", available)
