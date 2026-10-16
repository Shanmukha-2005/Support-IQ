import streamlit as st
import requests
from datetime import datetime

# -----------------------------
# Page Config
# -----------------------------
st.set_page_config(
    page_title="SupportIQ – AI Support Platform",
    layout="wide",
)

# -----------------------------
# Constants
# -----------------------------
BACKEND_URL = "http://127.0.0.1:8000"
ROLES = ["Customer", "Support Agent", "Admin"]

# -----------------------------
# Session State Init
# -----------------------------
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
if "role" not in st.session_state:
    st.session_state.role = None
if "email" not in st.session_state:
    st.session_state.email = None

# -----------------------------
# Logout Button (GLOBAL)
# -----------------------------
def logout():
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    st.rerun()

if st.session_state.logged_in:
    with st.sidebar:
        st.markdown("### 👤 Account")
        st.write(st.session_state.email)
        st.write(f"Role: **{st.session_state.role}**")
        st.button("🚪 Logout", on_click=logout)

# -----------------------------
# LOGIN PAGE
# -----------------------------
if not st.session_state.logged_in:
    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        st.markdown("## 🔐 SupportIQ Login")
        st.markdown("Enterprise AI Customer Support Platform")

        email = st.text_input("Email")
        role = st.selectbox("Select Role", ROLES)

        if st.button("Login", use_container_width=True):
            if email and role:
                st.session_state.logged_in = True
                st.session_state.email = email
                st.session_state.role = role
                st.rerun()
            else:
                st.warning("Please enter email and select role")

    st.stop()

def format_sla(ticket):
    deadline = datetime.fromisoformat(ticket["sla_deadline"])
    now = datetime.utcnow()
    remaining = deadline - now

    if ticket["sla_breached"]:
        return "🚨 SLA Breached"
    elif remaining.total_seconds() < 0:
        return "🚨 SLA Breached"
    else:
        hours = int(remaining.total_seconds() // 3600)
        minutes = int((remaining.total_seconds() % 3600) // 60)
        return f"⏳ {hours}h {minutes}m remaining"

# =====================================================
# DASHBOARDS
# =====================================================
role = st.session_state.role

AGENT_LEVELS = {
    "Beginner": ["Low"],
    "Intermediate": ["Low", "Medium"],
    "Senior": ["Low", "Medium", "High"]
}

# -----------------------------
# CUSTOMER DASHBOARD
# -----------------------------
if role == "Customer":
    st.markdown("## 🧑‍💼 Customer Dashboard")
    st.caption("Track your support request")

    with st.container(border=True):
        st.subheader("🎫 Raise a Support Ticket")
        ticket = st.text_area(
            "Describe your issue clearly",
            height=150,
            placeholder="Example: I forgot my password."
        )

        if st.button("Submit Ticket", type="primary"):
            if ticket.strip():
                try:
                    res = requests.post(
                        f"{BACKEND_URL}/analyze",
                        json={"ticket": ticket, "email": st.session_state.email}
                    )
                    data = res.json()

                    st.success("Ticket submitted successfully")

                    # -----------------------------
                    # Ticket Status
                    # -----------------------------
                    st.markdown("## 📌 Ticket Status")

                    status_map = {
                        "OPEN": "🟡 Open – Waiting for support agent",
                        "IN_PROGRESS": "🔵 In Progress – Agent is working",
                        "ESCALATED": "🔴 Escalated – High priority issue",
                        "RESOLVED": "✅ Resolved"
                    }

                    current_status = data.get("status", "OPEN")
                    st.info(status_map.get(current_status))

                    # -----------------------------
                    # SLA Remaining Time
                    # -----------------------------
                    st.markdown("## ⏱️ Estimated Resolution Time")

                    if "sla_deadline" in data:
                        st.write(format_sla(data))
                    else:
                        st.write("SLA assigned by support team")

                    # -----------------------------
                    # Progress Bar
                    # -----------------------------
                    progress_map = {
                        "OPEN": 25,
                        "IN_PROGRESS": 50,
                        "ESCALATED": 75,
                        "RESOLVED": 100
                    }

                    st.progress(progress_map.get(current_status, 10))

                    # -----------------------------
                    # Suggested Solution (ALWAYS VISIBLE)
                    # -----------------------------
                    st.markdown("## 💡 Suggested Solution")

                    st.success(
                        data.get(
                            "suggested_response",
                            "Our support team will review your issue and respond shortly."
                        )
                    )

                    # -----------------------------
                    # Collapsible Ticket Details
                    # -----------------------------
                    with st.expander("📄 View Ticket Details"):
                        st.markdown(f"**Issue Submitted:**")
                        st.write(ticket)

                        st.markdown("---")

                        st.markdown(f"**Submitted At:**")
                        st.write(data.get("created_at", "Just now"))

                        st.markdown("---")

                        st.markdown(f"**Category:** {data.get('category')}")
                        st.markdown(f"**Priority:** {data.get('priority')}")
                        st.markdown(f"**Assigned Team:** {data.get('route_to')}")
                        st.markdown(f"**Confidence Level:** {data.get('confidence')}")

                except Exception:
                    st.error("Backend not reachable")
            else:
                st.warning("Ticket description cannot be empty")

# -----------------------------
# SUPPORT AGENT DASHBOARD
# -----------------------------
elif role == "Support Agent":
    st.markdown("## 🛠️ Support Agent Dashboard")
    st.caption("View and manage assigned tickets")

    try:
        res = requests.get(f"{BACKEND_URL}/admin/tickets")
        tickets = res.json()
    except:
        tickets = []

    if "success_msg" in st.session_state:
        st.success(st.session_state["success_msg"])
        del st.session_state["success_msg"]

    if "error_msg" in st.session_state:
        st.error(st.session_state["error_msg"])
        del st.session_state["error_msg"]

    # -----------------------------
    # Priority Filter
    # -----------------------------
    priority_filter = st.selectbox(
        "Filter by Priority",
        ["All", "High", "Medium", "Low"],
        index=1
    )

    active_tickets = [t for t in tickets if t["status"] != "RESOLVED"]

    if priority_filter != "All":
        active_tickets = [
            t for t in active_tickets
            if t["priority"] == priority_filter
        ]

    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    active_tickets.sort(key=lambda t: priority_order.get(t["priority"], 3))

    # -----------------------------
    # Workload Summary (TODO style)
    # -----------------------------
    st.markdown("### 📋 Your Workload")

    col1, col2, col3 = st.columns(3)
    col1.metric("🔥 High Priority", sum(t["priority"] == "High" for t in active_tickets))
    col2.metric("⚠️ Medium Priority", sum(t["priority"] == "Medium" for t in active_tickets))
    col3.metric("🚨 SLA Breached", sum(t["sla_breached"] for t in active_tickets))

    st.divider()

    # -----------------------------
    # Collapsible Ticket List
    # -----------------------------
    if not active_tickets:
        st.info("No active tickets")
    else:
        for t in active_tickets:
            header = f"{t['priority']} | {t['category']} | SLA: {format_sla(t)}"

            with st.expander(header, expanded=False):

                if t["priority"] == "High":
                    st.error("🔥 High Priority – Immediate attention required")
                elif t["priority"] == "Medium":
                    st.warning("⚠️ Medium Priority")

                if t["sla_breached"]:
                    st.error("🚨 SLA breached — escalation required")

                st.markdown(f"**Ticket ID:** {t['ticket_id']}")
                st.markdown(f"**Issue:** {t['ticket']}")
                st.markdown(f"**Assigned To:** {t['assigned_to']}")
                st.markdown(f"**Current Status:** {t['status']}")

                new_status = st.selectbox(
                    "Update Status",
                    ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"],
                    index=["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"].index(t["status"]),
                    key=f"status_{t['ticket_id']}"
                )

                if st.button("Update Status", key=f"btn_{t['ticket_id']}"):
                    response = requests.post(
                        f"{BACKEND_URL}/admin/update-status",
                        json={
                            "ticket_id": t["ticket_id"],
                            "status": new_status
                        }
                    )

                    if response.status_code == 200:
                        st.session_state["success_msg"] = "Status updated successfully"
                        st.session_state["refresh"] = True
                    else:
                        st.session_state["error_msg"] = "Failed to update ticket"

    if st.session_state.get("refresh"):
        st.session_state["refresh"] = False
        st.rerun()

# -----------------------------
# ADMIN DASHBOARD
# -----------------------------
elif role == "Admin":
    st.markdown("## 📊 Admin Dashboard")
    st.caption("System-wide ticket analytics")

    try:
        res = requests.get(f"{BACKEND_URL}/admin/tickets")
        tickets = res.json()
    except:
        tickets = []

    total = len(tickets)
    breached = sum(1 for t in tickets if t.get("sla_breached"))
    on_time = total - breached

    col1, col2, col3 = st.columns(3)
    col1.metric("Total Tickets", total)
    col2.metric("SLA Breached", breached)
    col3.metric("Within SLA", on_time)

    # -----------------------------
    # Charts
    # -----------------------------
    categories = {}
    priorities = {}

    for t in tickets:
        categories[t["category"]] = categories.get(t["category"], 0) + 1
        priorities[t["priority"]] = priorities.get(t["priority"], 0) + 1

    col4, col5 = st.columns(2)

    with col4:
        st.markdown("### Tickets by Category")
        st.bar_chart(categories)

    with col5:
        st.markdown("### Tickets by Priority")
        st.bar_chart(priorities)

    # -----------------------------
    # Priority-wise Ticket Sections
    # -----------------------------
    st.markdown("## 🔎 Tickets by Priority")

    priority_groups = {
        "High": [],
        "Medium": [],
        "Low": []
    }

    for t in tickets:
        priority_groups[t["priority"]].append(t)

    for level, group in priority_groups.items():
        st.markdown(f"### {level} Priority Tickets ({len(group)})")

        if not group:
            st.info("No tickets in this priority")
        else:
            st.table([
                {
                    "Ticket": t["ticket"],
                    "Category": t["category"],
                    "Status": t["status"],
                    "Assigned To": t["assigned_to"],
                    "SLA": "🚨 Breached" if t["sla_breached"] else "OK"
                }
                for t in group
            ])

