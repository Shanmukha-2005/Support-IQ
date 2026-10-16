import uuid
from datetime import datetime, timedelta   # 🔹 timedelta added

tickets = []

# 🔹 SLA rules added
SLA_RULES = {
    "High": 60 * 60,        # 1 hour
    "Medium": 4 * 60 * 60,  # 4 hours
    "Low": 24 * 60 * 60     # 24 hours
}

def save_ticket(ticket_data):
    # 🔹 SLA calculation added
    sla_seconds = SLA_RULES.get(ticket_data.get("priority"), 24 * 60 * 60)

    ticket = {
        "ticket_id": str(uuid.uuid4()),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "status": "OPEN",
        "assigned_to": ticket_data.get("route_to"),

        # 🔹 SLA fields added
        "sla_deadline": (
            datetime.utcnow() + timedelta(seconds=sla_seconds)
        ).isoformat(),
        "sla_breached": False,
        "user_feedback": None,
        "feedback_at": None,
        **ticket_data
    }

    tickets.append(ticket)
    return ticket

# 🔹 SLA check added
def check_sla():
    now = datetime.utcnow()
    for ticket in tickets:
        if ticket["status"] != "RESOLVED":
            deadline = datetime.fromisoformat(ticket["sla_deadline"])
            if now > deadline:
                ticket["sla_breached"] = True

def get_all_tickets():
    check_sla()   # 🔹 SLA auto-check added
    return tickets

def update_ticket_status(ticket_id, new_status):
    for ticket in tickets:
        if ticket["ticket_id"] == ticket_id:
            ticket["status"] = new_status
            ticket["updated_at"] = datetime.utcnow().isoformat()
            return ticket
    return None

def update_ticket_feedback(ticket_id, feedback):
    for ticket in tickets:
        if ticket["ticket_id"] == ticket_id:
            ticket["user_feedback"] = feedback
            ticket["feedback_at"] = datetime.utcnow().isoformat()
            return ticket
    return None
