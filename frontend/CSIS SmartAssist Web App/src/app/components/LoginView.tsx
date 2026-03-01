import { useState } from "react";
import { useNavigate } from "react-router";

const DEMO_ACCOUNTS = [
  { email: "f20250699@goa.bits-pilani.ac.in", password: "student123", role: "student", name: "Mitresh Janarthanan", initials: "AS" },
  { email: "faculty@goa.bits-pilani.ac.in", password: "faculty123", role: "faculty", name: "Prof XYZ", initials: "DM" },
  { email: "adminCSIS@goa.bits-pilani.ac.in", password: "admin123", role: "admin", name: "Admin", initials: "AD" },
];

export function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student"); // Tracks active toggle
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate a small delay for realism
    setTimeout(() => {
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email === email.trim() && a.password === password
      );

      // Validation: Check credentials AND ensure they match the selected role
      if (!account || account.role !== selectedRole) {
        setError(`Invalid credentials. This account is not authorized for ${selectedRole} login.`);
        setIsLoading(false);
        return;
      }

      // Store user info in sessionStorage for use in other views
      sessionStorage.setItem("user", JSON.stringify(account));

      // Route to correct portal
      navigate(`/${account.role}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#1F4E79] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1F4E79]">CSIS SmartAssist</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered support assistant</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-lg font-medium text-[#1F4E79] mb-6">Sign in to your account</h2>

          {/* Role Selection Toggles */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-3 text-center uppercase tracking-wider font-semibold">Select Login Type</p>
            <div className="flex gap-2">
              {["student", "faculty", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setError(""); // Clear errors when switching roles
                  }}
                  className={`flex-1 py-2 border rounded text-xs transition-all capitalize font-medium ${
                    selectedRole === role
                      ? "bg-[#1F4E79] border-[#1F4E79] text-white shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="you@goa.bits-pilani.ac.in"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F4E79] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F4E79] text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#1F4E79] text-white py-2 px-4 rounded hover:bg-[#163a5a] transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          BITS Pilani Goa Campus — Department of Computer Science
        </p>
      </div>
    </div>
  );
}