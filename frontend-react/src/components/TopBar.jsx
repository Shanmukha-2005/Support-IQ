import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TopBar() {
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const agentLevel = localStorage.getItem("agentLevel");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply theme on load & change
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    navigate("/");
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-gray-100 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <span className="font-bold text-lg">
          SupportIQ
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 text-sm">
        {/* User Info */}
        <div className="text-right">
          <div className="font-medium">
            {email}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {role}
            {role === "Support Agent" && agentLevel
              ? ` • ${agentLevel}`
              : ""}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="Toggle dark mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default TopBar;
