const API_BASE = "http://127.0.0.1:8000";

export const submitTicket = async (ticket, email) => {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket, email }),
  });

  if (!res.ok) {
    throw new Error("Backend not reachable");
  }

  return res.json();
};

export const getTickets = async () => {
  const res = await fetch("http://127.0.0.1:8000/admin/tickets");
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
};

export const updateStatus = async (ticket_id, status) => {
  const res = await fetch("http://127.0.0.1:8000/admin/update-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket_id, status }),
  });

  if (!res.ok) throw new Error("Failed to update status");
};

