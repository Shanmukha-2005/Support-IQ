import { useEffect, useState } from "react";
import { getTickets } from "../services/api";
import TopBar from "../components/TopBar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const PRIORITY_BADGE = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
};

function Admin() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getTickets()
            .then(setTickets)
            .finally(() => setLoading(false));
    }, []);

    const total = tickets.length;
    const breached = tickets.filter(t => t.sla_breached).length;
    const onTime = total - breached;

    // Charts data
    const categoryData = Object.values(
        tickets.reduce((acc, t) => {
            acc[t.category] = acc[t.category] || { name: t.category, count: 0 };
            acc[t.category].count++;
            return acc;
        }, {})
    );

    const priorityData = Object.values(
        tickets.reduce((acc, t) => {
            acc[t.priority] = acc[t.priority] || { name: t.priority, count: 0 };
            acc[t.priority].count++;
            return acc;
        }, {})
    );

    const priorityGroups = {
        High: tickets.filter(t => t.priority === "High"),
        Medium: tickets.filter(t => t.priority === "Medium"),
        Low: tickets.filter(t => t.priority === "Low"),
    };

    return (
        <>
            <TopBar />
            <div className="p-8 max-w-7xl mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen">
                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">📊 Admin Dashboard</h1>
                    <p className="text-gray-500">
                        System-wide support analytics and SLA monitoring
                    </p>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 text-gray-800 dark:text-gray-100">
                        <p className="text-gray-500 text-sm">Total Tickets</p>
                        <p className="text-3xl font-bold">{total}</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <p className="text-red-700 text-sm">SLA Breached</p>
                        <p className="text-3xl font-bold text-red-700">{breached}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <p className="text-green-700 text-sm">Within SLA</p>
                        <p className="text-3xl font-bold text-green-700">{onTime}</p>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-72 text-gray-800 dark:text-gray-100">
                        <h3 className="font-semibold mb-3">Tickets by Category</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6 h-72">
                        <h3 className="font-semibold mb-3">Tickets by Priority</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PRIORITY TABLES */}
                <h2 className="text-xl font-bold mb-4">🔎 Tickets by Priority</h2>

                {Object.entries(priorityGroups).map(([level, group]) => (
                    <div key={level} className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_BADGE[level]}`}
                            >
                                {level}
                            </span>
                            <span className="text-sm text-gray-500">
                                ({group.length} tickets)
                            </span>
                        </div>

                        {group.length === 0 ? (
                            <p className="text-gray-500">No tickets in this priority</p>
                        ) : (
                            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow text-gray-800 dark:text-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Issue</th>
                                            <th className="p-3 text-center">Category</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3 text-center">Assigned</th>
                                            <th className="p-3 text-center">SLA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.map(t => (
                                            <tr key={t.ticket_id} className="border-t">
                                                <td className="p-3">{t.ticket}</td>
                                                <td className="p-3 text-center">{t.category}</td>
                                                <td className="p-3 text-center">{t.status}</td>
                                                <td className="p-3 text-center">{t.assigned_to}</td>
                                                <td className="p-3 text-center">
                                                    {t.sla_breached ? "🚨 Breached" : "OK"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}

export default Admin;
