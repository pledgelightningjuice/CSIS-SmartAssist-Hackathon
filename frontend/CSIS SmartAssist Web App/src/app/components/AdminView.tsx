import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  BookOpen,
  Megaphone,
  FileText,
  Upload,
  CheckCircle,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

type NavItem = "bookings" | "knowledge" | "announcements";

interface Booking {
  id: string;
  requester: string;
  resource: string;
  date: string;
  time: string;
  duration: string;
  status: "pending" | "approved" | "rejected";
}

interface KnowledgeDoc {
  id: number;
  name: string;
  type: string;
  department: string;
  uploadDate: string;
  indexed: boolean;
}

interface AnnouncementPost {
  id: string;
  content: string;
  created_at: string;
  posted_by: string;
}

export function AdminView() {
  const [activeNav, setActiveNav] = useState<NavItem>("bookings");
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected" | "history">("all");
  const [announcementText, setAnnouncementText] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [announcementHistory, setAnnouncementHistory] = useState<AnnouncementPost[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<KnowledgeDoc[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBookings();
    fetchAnnouncements();
    const interval = setInterval(() => {
      fetchBookings();
      fetchAnnouncements();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings`);
      const data = await res.json();
      setBookings(data.map((b: any) => ({
        id: b.id,
        requester: b.requester,
        resource: b.resource,
        date: b.date,
        time: b.time,
        duration: b.duration,
        status: b.status,
      })));
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      const data = await res.json();
      setAnnouncementHistory(data);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`${API_BASE}/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      fetchBookings();
    } catch (err) {
      console.error("Failed to approve booking:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`${API_BASE}/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      fetchBookings();
    } catch (err) {
      console.error("Failed to reject booking:", err);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) return;
    setIsPostingAnnouncement(true);

    try {
      await fetch(`${API_BASE}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: announcementText, posted_by: "Admin" }),
      });
      setAnnouncementText("");
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to post announcement:", err);
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setUploadedDocs((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: data.filename,
          type: data.filename.split(".").pop()?.toUpperCase() || "FILE",
          department: "Computer Science",
          uploadDate: new Date().toISOString().split("T")[0],
          indexed: data.status === "indexed",
        },
      ]);
    } catch (err) {
      console.error("Failed to upload document:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    if (activeTab === "history") return booking.status === "approved" || booking.status === "rejected";
    return booking.status === activeTab;
  });

  const navItems = [
    { id: "bookings" as NavItem, icon: Calendar, label: "Bookings" },
    { id: "knowledge" as NavItem, icon: BookOpen, label: "Knowledge Base" },
    { id: "announcements" as NavItem, icon: Megaphone, label: "Announcements" },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Left Navigation */}
      <div
        className={`bg-[#1F4E79] transition-all duration-300 ${isNavExpanded ? "w-[220px]" : "w-[60px]"}`}
        onMouseEnter={() => setIsNavExpanded(true)}
        onMouseLeave={() => setIsNavExpanded(false)}
      >
        <div className="p-4 border-b border-white/20">
          <h1 className={`text-white font-medium transition-opacity ${isNavExpanded ? "opacity-100" : "opacity-0"}`}>
            CSIS Admin
          </h1>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded mb-1 transition-colors ${
                activeNav === item.id ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm whitespace-nowrap transition-opacity ${isNavExpanded ? "opacity-100" : "opacity-0"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Bookings View */}
        {activeNav === "bookings" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl text-[#1F4E79] mb-2">Bookings Management</h1>
              <p className="text-sm text-gray-600">Review and manage all booking requests</p>
            </div>

            <div className="flex gap-2 mb-4">
              {(["all", "pending", "approved", "rejected", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === tab ? "bg-[#1F4E79] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    {["Requester", "Resource", "Date", "Time", "Duration", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-sm text-[#1F4E79]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No bookings found.</td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-800">{booking.requester}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{booking.resource}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{booking.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{booking.time}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{booking.duration}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs text-white ${
                            booking.status === "pending" ? "bg-yellow-400" :
                            booking.status === "approved" ? "bg-green-500" : "bg-red-500"
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(booking.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(booking.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Knowledge Base View */}
        {activeNav === "knowledge" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl text-[#1F4E79] mb-2">Knowledge Base</h1>
                <p className="text-sm text-gray-600">Manage uploaded documents and resources</p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.txt"
                  onChange={handleUploadDocument}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1F4E79] text-white rounded hover:bg-[#163a5a] transition-colors text-sm disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </div>

            {uploadedDocs.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded yet. Upload a PDF or DOCX to get started.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#D6E4F0] rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-[#1F4E79]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-[#1F4E79] font-medium truncate">{doc.name}</h3>
                        <p className="text-xs text-gray-600">{doc.type}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="text-gray-800">{doc.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uploaded:</span>
                        <span className="text-gray-800">{doc.uploadDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        {doc.indexed ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Indexed
                          </span>
                        ) : (
                          <span className="text-yellow-600 text-xs">Processing</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Announcements View */}
        {activeNav === "announcements" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl text-[#1F4E79] mb-2">Announcements</h1>
              <p className="text-sm text-gray-600">Create and manage department announcements</p>
            </div>

            <div className="bg-white border border-gray-200 rounded p-4 mb-6">
              <h3 className="text-base text-[#1F4E79] font-medium mb-3">Create New Announcement</h3>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Write your announcement here..."
                className="w-full px-4 py-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#1F4E79] text-sm"
                rows={4}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handlePostAnnouncement}
                  disabled={isPostingAnnouncement}
                  className="px-6 py-2 bg-[#1F4E79] text-white rounded hover:bg-[#163a5a] transition-colors text-sm disabled:opacity-50"
                >
                  {isPostingAnnouncement ? "Posting..." : "Post Announcement"}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base text-[#1F4E79] font-medium mb-3">Post History</h3>
              {announcementHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No announcements posted yet.</p>
              ) : (
                <div className="space-y-3">
                  {announcementHistory.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded p-4">
                      <p className="text-sm text-gray-800 mb-2">{post.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Posted by {post.posted_by}</span>
                        <span>{post.created_at}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
