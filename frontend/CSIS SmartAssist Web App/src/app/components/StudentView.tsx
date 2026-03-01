import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

const API_BASE = "http://localhost:8000";
const USER_ID = "f20250699@goa.bits-pilani.ac.in";
const REQUESTER_NAME = "John Smith";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  source?: string | null;
  booking?: {
    resource: string;
    date: string;
    time: string;
    duration: string;
  };
}

interface BookingRequest {
  id: string;
  resource: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

export function StudentView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm CSIS SmartAssist. How can I help you today?",
      source: "System Message",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [confirmingBooking, setConfirmingBooking] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch bookings on load and periodically
  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings?user_id=${USER_ID}`);
      const data = await res.json();
      setBookingRequests(data.map((b: any) => ({
        id: b.id,
        resource: b.resource,
        date: b.date,
        status: b.status,
      })));
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue, user_id: USER_ID }),
      });

      const data = await res.json();

      const botMessage: Message = {
        id: messages.length + 2,
        type: "bot",
        content: data.content,
        source: data.source || null,
        booking: data.type === "booking" ? data.booking : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "bot",
          content: "Sorry, I'm having trouble connecting to the server. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (messageId: number, booking: Message["booking"]) => {
    if (!booking) return;
    setConfirmingBooking(messageId);

    try {
      const res = await fetch(`${API_BASE}/bookings/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          requester: REQUESTER_NAME,
          resource: booking.resource,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
        }),
      });

      const data = await res.json();

      if (data.status === "unavailable") {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: "bot",
            content: data.message,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: "bot",
            content: `Your booking for ${booking.resource} on ${booking.date} at ${booking.time} has been submitted! You'll receive an email once it's approved.`,
          },
        ]);
        fetchBookings();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "bot",
          content: "Failed to confirm booking. Please try again.",
        },
      ]);
    } finally {
      setConfirmingBooking(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-400";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-[280px] bg-[#F5F5F5] border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#1F4E79] flex items-center justify-center text-white mb-3">
              <span className="text-2xl">JS</span>
            </div>
            <h3 className="text-base text-[#1F4E79] font-medium">{REQUESTER_NAME}</h3>
            <p className="text-sm text-gray-600">Student</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-sm text-[#1F4E79] font-medium mb-3">Booking Requests</h4>
          {bookingRequests.length === 0 ? (
            <p className="text-xs text-gray-500">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {bookingRequests.map((request) => (
                <div key={request.id} className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-[#1F4E79]">{request.resource}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{request.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Interface */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-[#1F4E79] text-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-medium">CSIS SmartAssist</h1>
          <p className="text-sm text-white/80">AI-powered support assistant</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${message.type === "user" ? "" : "space-y-2"}`}>
                <div className={`p-4 rounded ${message.type === "user" ? "bg-[#1F4E79] text-white" : "bg-white border border-gray-300"}`}>
                  <p className="text-sm">{message.content}</p>

                  {message.booking && (
                    <div className="mt-4 p-4 bg-[#D6E4F0] rounded space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Resource:</span>
                        <span className="text-[#1F4E79] font-medium">{message.booking.resource}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-[#1F4E79] font-medium">{message.booking.date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="text-[#1F4E79] font-medium">{message.booking.time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="text-[#1F4E79] font-medium">{message.booking.duration}</span>
                      </div>
                      <button
                        onClick={() => handleConfirmBooking(message.id, message.booking)}
                        disabled={confirmingBooking === message.id}
                        className="w-full mt-3 bg-[#1F4E79] text-white py-2 px-4 rounded hover:bg-[#163a5a] transition-colors text-sm disabled:opacity-50"
                      >
                        {confirmingBooking === message.id ? "Confirming..." : "Confirm Booking"}
                      </button>
                    </div>
                  )}
                </div>

                {message.source && (
                  <div className="flex justify-start">
                    <span className="inline-block px-3 py-1 bg-[#D6E4F0] text-[#1F4E79] text-xs rounded-full">
                      Source: {message.source}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-300 p-4 rounded">
                <p className="text-sm text-gray-500">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F4E79] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-[#1F4E79] text-white p-2 rounded hover:bg-[#163a5a] transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
