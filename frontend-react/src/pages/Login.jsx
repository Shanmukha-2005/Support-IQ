import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = ["Customer", "Support Agent", "Admin"];
const AGENT_LEVELS = ["Junior", "Intermediate", "Senior"];

const ROLE_HELP = {
  Customer: "Raise and track support tickets",
  "Support Agent": "Resolve customer issues based on priority",
  Admin: "Monitor system-wide support performance",
};

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [agentLevel, setAgentLevel] = useState("");

  const isValid =
    email &&
    role &&
    (role !== "Support Agent" || agentLevel);

  const handleLogin = () => {
    if (!isValid) return;

    localStorage.setItem("email", email);
    localStorage.setItem("role", role);

    if (role === "Support Agent") {
      localStorage.setItem("agentLevel", agentLevel);
    } else {
      localStorage.removeItem("agentLevel");
    }

    if (role === "Customer") navigate("/customer");
    if (role === "Support Agent") navigate("/agent");
    if (role === "Admin") navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold text-gray-800">
            SupportIQ
          </h1>
          <p className="text-sm text-gray-500">
            AI-Powered Support Intelligence Platform
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full mt-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Role
            </label>
            <select
              className="w-full mt-1 border rounded-lg px-4 py-2"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setAgentLevel("");
              }}
            >
              <option value="">Select your role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {role && (
              <p className="text-xs text-gray-500 mt-1">
                {ROLE_HELP[role]}
              </p>
            )}
          </div>

          {/* Agent Level */}
          {role === "Support Agent" && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Agent Level
              </label>
              <select
                className="w-full mt-1 border rounded-lg px-4 py-2"
                value={agentLevel}
                onChange={(e) => setAgentLevel(e.target.value)}
              >
                <option value="">Select agent level</option>
                {AGENT_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-1">
                Determines which ticket priorities you can handle
              </p>
            </div>
          )}

          <button
            disabled={!isValid}
            onClick={handleLogin}
            className={`w-full py-2 rounded-lg font-medium transition
              ${
                isValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Sign In
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Internal support platform • Demo-ready UI
        </div>
      </div>
    </div>
  );
}

export default Login;
