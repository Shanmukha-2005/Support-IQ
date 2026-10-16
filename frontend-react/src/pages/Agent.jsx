import { useEffect, useState } from "react";
import { getTickets, updateStatus } from "../services/api";
import TopBar from "../components/TopBar";

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const AGENT_PRIORITY_ACCESS = {
  Junior: ["Low"],
  Intermediate: ["Low", "Medium"],
  Senior: ["Low", "Medium", "High"],
};

const PRIORITY_BADGE = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

/* ---------- SLA FORMATTER ---------- */
function formatSLA(ticket) {
  if (!ticket.sla_deadline) return "SLA not assigned";

  if (ticket.sla_breached) {
    return "🚨 SLA Breached";
  }

  const deadline = new Date(ticket.sla_deadline);
  const nowUtc = new Date(new Date().toISOString());
  const diffMs = deadline - nowUtc;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor(
    (diffMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  return `🟢 Within SLA • ${hours}h ${minutes}m remaining`;
}

function Agent() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const agentLevel = localStorage.getItem("agentLevel") || "Junior";
  const email = localStorage.getItem("email");
  const allowedPriorities = AGENT_PRIORITY_ACCESS[agentLevel];

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load tickets" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const activeTickets = tickets
    .filter((t) => t.status !== "RESOLVED")
    .filter((t) => allowedPriorities.includes(t.priority))
    .filter((t) => (filter === "All" ? true : t.priority === filter))
    .sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );

  const handleUpdate = async (ticket_id, status) => {
    try {
      await updateStatus(ticket_id, status);
      setMessage({ type: "success", text: "Status updated successfully" });
      loadTickets();
    } catch {
      setMessage({ type: "error", text: "Failed to update ticket" });
    }
  };

  const highCount = activeTickets.filter(t => t.priority === "High").length;
  const medCount = activeTickets.filter(t => t.priority === "Medium").length;
  const slaBreached = activeTickets.filter(t => t.sla_breached).length;

  return (
    <>
      <TopBar />

      <div className="p-8 max-w-7xl mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen">

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6 text-gray-800 dark:text-gray-100 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">🛠️ Support Agent Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Logged in as <b>{email}</b>
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-4 py-2 rounded-lg">
            Agent Level: <b>{agentLevel}</b> <br />
            Can handle: {allowedPriorities.join(", ")}
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4 rounded-xl">
            🔥 High Priority
            <div className="text-2xl font-bold">{highCount}</div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl">
            ⚠️ Medium Priority
            <div className="text-2xl font-bold">{medCount}</div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 p-4 rounded-xl">
            🚨 SLA Breached
            <div className="text-2xl font-bold">{slaBreached}</div>
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-6">
          <label className="text-sm text-gray-600 mr-2">
            Filter by Priority:
          </label>
          <select
            className="border rounded px-4 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            {allowedPriorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* TICKET LIST */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : activeTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center text-gray-600 dark:text-gray-300">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="font-semibold text-lg mb-1">
              No active tickets
            </h3>
            <p className="text-sm">
              You’re all caught up. New tickets will appear here when assigned.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTickets.map((t) => (
              <div
                key={t.ticket_id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-gray-800 dark:text-gray-100"
              >
                {/* CARD HEADER */}
                <div className="flex flex-wrap items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_BADGE[t.priority]}`}
                    >
                      {t.priority}
                    </span>

                    {t.sla_breached && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                        SLA BREACHED
                      </span>
                    )}
                  </div>

                  <span className="text-sm text-gray-500">
                    {t.category}
                  </span>
                </div>

                {/* ISSUE */}
                <p className="text-sm mb-3">
                  <b>Issue:</b> {t.ticket}
                </p>

                {/* META */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                  <p><b>Ticket ID:</b> {t.ticket_id}</p>
                  <p><b>Assigned To:</b> {t.assigned_to}</p>
                  <p><b>Status:</b> {t.status}</p>
                  <p>
                    <b>SLA:</b>{" "}
                    <span
                      className={
                        t.sla_breached
                          ? "text-red-600 font-semibold"
                          : "text-green-600"
                      }
                    >
                      {formatSLA(t)}
                    </span>
                  </p>
                </div>

                {/* ACTION */}
                <div className="flex items-center gap-3">
                  <select
                    className="border rounded px-3 py-2"
                    defaultValue={t.status}
                    onChange={(e) =>
                      handleUpdate(t.ticket_id, e.target.value)
                    }
                  >
                    <option>OPEN</option>
                    <option>IN_PROGRESS</option>
                    <option>ESCALATED</option>
                    <option>RESOLVED</option>
                  </select>

                  <span className="text-xs text-gray-500">
                    Update ticket status
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Agent;
