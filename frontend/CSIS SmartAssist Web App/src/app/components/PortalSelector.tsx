import { Link } from "react-router";
import { GraduationCap, BookOpen, Shield } from "lucide-react";

export function PortalSelector() {
  const portals = [
    {
      path: "/student",
      icon: GraduationCap,
      title: "Student Portal",
      description: "Access AI assistance and track booking requests",
    },
    {
      path: "/faculty",
      icon: BookOpen,
      title: "Faculty Portal",
      description: "Manage resources and view department news",
    },
    {
      path: "/admin",
      icon: Shield,
      title: "Admin Portal",
      description: "Manage bookings, knowledge base, and announcements",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-[#1F4E79] mb-3">CSIS SmartAssist</h1>
          <p className="text-gray-600">Select your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <Link
              key={portal.path}
              to={portal.path}
              className="bg-white border border-gray-200 rounded p-6 hover:border-[#1F4E79] hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#D6E4F0] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1F4E79] transition-colors">
                  <portal.icon className="w-8 h-8 text-[#1F4E79] group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-xl text-[#1F4E79] mb-2">{portal.title}</h2>
                <p className="text-sm text-gray-600">{portal.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
