import { useState } from "react";
import {
  Calendar,
  BookOpen,
  Megaphone,
  FileText,
  Upload,
  CheckCircle,
} from "lucide-react";

type NavItem = "bookings" | "knowledge" | "announcements";

interface Booking {
  id: number;
  requester: string;
  resource: string;
  date: string;
  time: string;
  duration: string;
  status: "pending" | "approved" | "rejected";
}

interface Document {
  id: number;
  name: string;
  type: string;
  department: string;
  uploadDate: string;
  indexed: boolean;
}

interface AnnouncementPost {
  id: number;
  content: string;
  timestamp: string;
  author: string;
}

export function AdminView() {
  const [activeNav, setActiveNav] =
    useState<NavItem>("bookings");
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "rejected" | "history"
  >("all");
  const [announcementText, setAnnouncementText] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      requester: "John Smith",
      resource: "Lecture Theatre 4",
      date: "2026-02-25",
      time: "2:00 PM",
      duration: "2 hours",
      status: "pending",
    },
    {
      id: 2,
      requester: "Dr. Roberts",
      resource: "Conference Room",
      date: "2026-02-26",
      time: "10:00 AM",
      duration: "3 hours",
      status: "pending",
    },
    {
      id: 3,
      requester: "Jane Doe",
      resource: "DLT 7",
      date: "2026-02-24",
      time: "1:00 PM",
      duration: "1 hour",
      status: "approved",
    },
    {
      id: 4,
      requester: "Mike Johnson",
      resource: "Projector",
      date: "2026-02-20",
      time: "3:00 PM",
      duration: "2 hours",
      status: "rejected",
    },
  ]);

  const documents: Document[] = [
    {
      id: 1,
      name: "TA_Policy.pdf",
      type: "PDF",
      department: "Computer Science",
      uploadDate: "2026-02-15",
      indexed: true,
    },
    {
      id: 2,
      name: "Faculty_Handbook.pdf",
      type: "PDF",
      department: "All Departments",
      uploadDate: "2026-02-10",
      indexed: true,
    },
    {
      id: 3,
      name: "Lab_Safety_Guidelines.docx",
      type: "DOCX",
      department: "Engineering",
      uploadDate: "2026-02-12",
      indexed: false,
    },
    {
      id: 4,
      name: "Course_Catalog_2026.pdf",
      type: "PDF",
      department: "Registrar",
      uploadDate: "2026-01-30",
      indexed: true,
    },
  ];

  const [announcementHistory, setAnnouncementHistory] =
    useState<AnnouncementPost[]>([
      {
        id: 1,
        content:
          "Faculty Meeting on March 1st at 2:00 PM in Conference Room A.",
        timestamp: "2026-02-23 10:30 AM",
        author: "Admin",
      },
      {
        id: 2,
        content:
          "New TA Assignments have been posted. Please check your email.",
        timestamp: "2026-02-22 3:15 PM",
        author: "Admin",
      },
    ]);

  const handleApprove = (id: number) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id
          ? { ...booking, status: "approved" as const }
          : booking,
      ),
    );
  };

  const handleReject = (id: number) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id
          ? { ...booking, status: "rejected" as const }
          : booking,
      ),
    );
  };

  const handlePostAnnouncement = () => {
    if (!announcementText.trim()) return;

    const newAnnouncement: AnnouncementPost = {
      id: announcementHistory.length + 1,
      content: announcementText,
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      author: "Admin",
    };

    setAnnouncementHistory([
      newAnnouncement,
      ...announcementHistory,
    ]);
    setAnnouncementText("");
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    if (activeTab === "history")
      return (
        booking.status === "approved" ||
        booking.status === "rejected"
      );
    return booking.status === activeTab;
  });

  const navItems = [
    {
      id: "bookings" as NavItem,
      icon: Calendar,
      label: "Bookings",
    },
    {
      id: "knowledge" as NavItem,
      icon: BookOpen,
      label: "Knowledge Base",
    },
    {
      id: "announcements" as NavItem,
      icon: Megaphone,
      label: "Announcements",
    },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Left Navigation */}
      <div
        className={`bg-[#1F4E79] transition-all duration-300 ${
          isNavExpanded ? "w-[220px]" : "w-[60px]"
        }`}
        onMouseEnter={() => setIsNavExpanded(true)}
        onMouseLeave={() => setIsNavExpanded(false)}
      >
        <div className="p-4 border-b border-white/20">
          <h1
            className={`text-white font-medium transition-opacity ${
              isNavExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            CSIS Admin
          </h1>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded mb-1 transition-colors ${
                activeNav === item.id
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={`whitespace-nowrap transition-opacity text-sm ${
                  isNavExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Bookings View */}
          {activeNav === "bookings" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl text-[#1F4E79] mb-2">
                  Bookings Management
                </h1>
                <p className="text-sm text-gray-600">
                  Review and manage all booking requests
                </p>
              </div>

              <div className="flex gap-2 mb-6">
                {[
                  "all",
                  "pending",
                  "approved",
                  "rejected",
                  "history",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(tab as typeof activeTab)
                    }
                    className={`px-4 py-2 rounded text-sm transition-colors ${
                      activeTab === tab
                        ? "bg-[#1F4E79] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      <th className="px-4 py-3 text-left text-sm text-[#1F4E79]">
                        Requester
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-[#1F4E79]">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-[#1F4E79]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-[#1F4E79]">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-[#1F4E79]">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-[#1F4E79]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-[#1F4E79]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-t border-gray-200"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {booking.requester}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {booking.resource}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {booking.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {booking.time}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {booking.duration}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs text-white ${
                              booking.status === "pending"
                                ? "bg-yellow-400"
                                : booking.status === "approved"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                            }`}
                          >
                            {booking.status
                              .charAt(0)
                              .toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleApprove(booking.id)
                                }
                                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(booking.id)
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
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
                  <h1 className="text-2xl text-[#1F4E79] mb-2">
                    Knowledge Base
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage uploaded documents and resources
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1F4E79] text-white rounded hover:bg-[#163a5a] transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#D6E4F0] rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-[#1F4E79]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-[#1F4E79] font-medium truncate">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {doc.type}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Department:
                        </span>
                        <span className="text-gray-800">
                          {doc.department}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Uploaded:
                        </span>
                        <span className="text-gray-800">
                          {doc.uploadDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Status:
                        </span>
                        {doc.indexed ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Indexed
                          </span>
                        ) : (
                          <span className="text-yellow-600 text-xs">
                            Processing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Announcements View */}
          {activeNav === "announcements" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl text-[#1F4E79] mb-2">
                  Announcements
                </h1>
                <p className="text-sm text-gray-600">
                  Create and manage department announcements
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded p-4 mb-6">
                <h3 className="text-base text-[#1F4E79] font-medium mb-3">
                  Create New Announcement
                </h3>
                <textarea
                  value={announcementText}
                  onChange={(e) =>
                    setAnnouncementText(e.target.value)
                  }
                  placeholder="Write your announcement here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#1F4E79] text-sm"
                  rows={4}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handlePostAnnouncement}
                    className="px-6 py-2 bg-[#1F4E79] text-white rounded hover:bg-[#163a5a] transition-colors text-sm"
                  >
                    Post Announcement
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base text-[#1F4E79] font-medium mb-3">
                  Post History
                </h3>
                <div className="space-y-3">
                  {announcementHistory.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white border border-gray-200 rounded p-4"
                    >
                      <p className="text-sm text-gray-800 mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Posted by {post.author}</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}