import os
import datetime
import pickle
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

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
        import pytz
        IST = pytz.timezone("Asia/Kolkata")
       
        dt_str = f"{date} {time}"
        try:
            dt_start = datetime.datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
        except:
            try:
                dt_start = datetime.datetime.strptime(dt_str, "%Y-%m-%d %H:%M %p")
            except:
                dt_start = datetime.datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
       
        dt_start = IST.localize(dt_start)
        dt_end = dt_start + datetime.timedelta(hours=duration_hours)

        # Get ALL events in that time window, not just resource-specific ones
        events_result = service.events().list(
            calendarId="primary",
            timeMin=dt_start.isoformat(),
            timeMax=dt_end.isoformat(),
            singleEvents=True,
            orderBy="startTime"
        ).execute()

        events = events_result.get("items", [])
       
        # Check if any event mentions this resource
        for event in events:
            summary = event.get("summary", "").lower()
            if resource.lower() in summary:
                print(f"Conflict found: {summary}")
                return False  # Not available
       
        return True  # Available
       
    except Exception as e:
        print(f"Calendar check error: {e}")
        return True  # Default to available if check fails

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
    
