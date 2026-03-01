import { useState } from "react";
import { Send } from "lucide-react";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  source?: string;
  booking?: {
    resource: string;
    date: string;
    time: string;
    duration: string;
  };
}

interface BookingRequest {
  id: number;
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
  
  const bookingRequests: BookingRequest[] = [
    { id: 1, resource: "Meeting Room A", date: "2026-02-25", status: "pending" },
    { id: 2, resource: "Lab Computer 12", date: "2026-02-24", status: "approved" },
    { id: 3, resource: "Projector", date: "2026-02-20", status: "rejected" },
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
    };

    const newBotMessage: Message = {
      id: messages.length + 2,
      type: "bot",
      content: "I understand you'd like to book a resource. Here are the available options for that date.",
      source: "TA_Policy.pdf, p.3",
      booking: {
        resource: "Meeting Room B",
        date: "2026-02-26",
        time: "2:00 PM",
        duration: "2 hours",
      },
    };

    setMessages([...messages, newUserMessage, newBotMessage]);
    setInputValue("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
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
            <h3 className="text-base text-[#1F4E79] font-medium">John Smith</h3>
            <p className="text-sm text-gray-600">Student</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-sm text-[#1F4E79] font-medium mb-3">Booking Requests</h4>
          <div className="space-y-2">
            {bookingRequests.map((request) => (
              <div key={request.id} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-[#1F4E79]">{request.resource}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{request.date}</p>
              </div>
            ))}
          </div>
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
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] ${message.type === "user" ? "" : "space-y-2"}`}>
                <div
                  className={`p-4 rounded ${
                    message.type === "user"
                      ? "bg-[#1F4E79] text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
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
                      <button className="w-full mt-3 bg-[#1F4E79] text-white py-2 px-4 rounded hover:bg-[#163a5a] transition-colors text-sm">
                        Confirm Booking
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
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F4E79]"
            />
            <button
              onClick={handleSend}
              className="bg-[#1F4E79] text-white p-2 rounded hover:bg-[#163a5a] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
