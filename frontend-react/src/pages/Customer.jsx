import { useState } from "react";
import { submitTicket } from "../services/api";
import TopBar from "../components/TopBar";

const STATUS_MAP = {
    OPEN: { label: "Open", color: "bg-yellow-100 text-yellow-700" },
    IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
    ESCALATED: { label: "Escalated", color: "bg-red-100 text-red-700" },
    RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700" },
};

const PROGRESS_MAP = {
    OPEN: 25,
    IN_PROGRESS: 50,
    ESCALATED: 75,
    RESOLVED: 100,
};

function Customer() {
    const email = localStorage.getItem("email");

    const [ticket, setTicket] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!ticket.trim()) {
            alert("Ticket description cannot be empty");
            return;
        }

        try {
            setLoading(true);
            const data = await submitTicket(ticket, email);
            setResult(data);
        } catch {
            alert("Backend not reachable");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TopBar />
            <div className="p-8 max-w-7xl mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen">
                <h1 className="text-2xl font-bold mb-1">Customer Dashboard</h1>
                <p className="text-gray-500 mb-6">
                    Track and manage your support requests
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* PROFILE PANEL */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-gray-800 dark:text-gray-100">
                        <div className="text-center">
                            <div className="text-4xl mb-2">👤</div>
                            <h3 className="font-semibold text-gray-800">
                                Customer Profile
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{email}</p>
                        </div>

                        <div className="mt-6 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Role</span>
                                <span className="font-medium">Customer</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Account Status</span>
                                <span className="text-green-600 font-medium">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* TICKET FORM */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-gray-800 dark:text-gray-100">
                            <h2 className="font-semibold mb-3">
                                🎫 Raise a Support Ticket
                            </h2>

                            <textarea
                                className="w-full border rounded-lg p-3 h-32"
                                placeholder="Describe your issue clearly..."
                                value={ticket}
                                onChange={(e) => setTicket(e.target.value)}
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`mt-4 px-6 py-2 rounded-lg font-medium transition
    ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                            >
                                {loading ? "Submitting ticket…" : "Submit Ticket"}
                            </button>

                        </div>

                        {/* TICKET RESULT */}
                        {result && (
                            <>
                                {/* STATUS + SLA */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800 dark:text-gray-100">
                                    <div>
                                        <h3 className="text-sm text-gray-500 mb-1">
                                            Ticket Status
                                        </h3>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_MAP[result.status]?.color
                                                }`}
                                        >
                                            {STATUS_MAP[result.status]?.label || "Open"}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-gray-500 mb-1">
                                            SLA Status
                                        </h3>
                                        <p className="font-medium">
                                            {result.sla_breached
                                                ? "🚨 SLA Breached"
                                                : "⏳ Within SLA"}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-gray-500 mb-1">
                                            Progress
                                        </h3>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-blue-600 h-3 rounded-full"
                                                style={{
                                                    width: `${PROGRESS_MAP[result.status] || 10
                                                        }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SUGGESTED SOLUTION */}
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <h3 className="font-semibold mb-2">
                                        💡 Suggested Solution
                                    </h3>
                                    <p>
                                        {result.suggested_response ||
                                            "Our support team will review your issue shortly."}
                                    </p>
                                </div>

                                {/* DETAILS */}
                                <details className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-gray-800 dark:text-gray-100">
                                    <summary className="cursor-pointer font-semibold">
                                        📄 View Ticket Details
                                    </summary>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <p>
                                            <b>Issue:</b> {ticket}
                                        </p>
                                        <p>
                                            <b>Category:</b> {result.category}
                                        </p>
                                        <p>
                                            <b>Priority:</b> {result.priority}
                                        </p>
                                        <p>
                                            <b>Assigned Team:</b> {result.route_to}
                                        </p>
                                        <p>
                                            <b>Confidence:</b> {result.confidence}
                                        </p>
                                    </div>
                                </details>
                            </>
                        )}
                        {loading && (
                            <div className="bg-white rounded-xl shadow p-6 mt-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}

export default Customer;
