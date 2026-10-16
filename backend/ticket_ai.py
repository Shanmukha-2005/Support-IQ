from rag_engine import (
    load_knowledge_base,
    retrieve_relevant_knowledge,
    generate_response,
    retrieve_relevant_knowledge_v2,
    generate_response_v2,
    retrieve_relevant_knowledge_v3,
    generate_response_v3
)

SEVERITY_KEYWORDS = {
    "High": ["immediately", "critical", "escalated", "multiple users", "money deducted","charged twice","double charged"],
    "Medium": ["verify", "processed", "locked", "delay"],
}

URGENT_KEYWORDS = [
    "urgent", "immediately", "asap", "down",
    "not working", "cannot", "failed", "error"
]

CATEGORY_RULES = {
    "Billing": ["payment", "refund", "charged", "invoice"],
    "Login / Account": ["login", "password", "account", "sign in"],
    "Technical Issue": ["error", "bug", "crash", "not working"],
    "Feature Request": ["feature", "add", "improve", "request"],
}

CATEGORY_DOC_MAP = {
    "Billing": ["billing.txt"],
    "Login / Account": ["login.txt"],
    "Technical Issue": ["technical.txt", "login.txt"],
    "Feature Request": ["general.txt"],
    "Other": ["general.txt"]
}

ROUTING = {
    "Billing": "Finance Team",
    "Login / Account": "Support Team",
    "Technical Issue": "Engineering Team",
    "Feature Request": "Product Team",
    "Other": "General Support"
}

def detect_knowledge_severity(text):
    text = text.lower()

    for level, keywords in SEVERITY_KEYWORDS.items():
        if any(k in text for k in keywords):
            return level
    return "Low"

def analyze_ticket(text: str):
    text = text.lower()

    # Category
    category = "Other"
    for cat, keywords in CATEGORY_RULES.items():
        if any(k in text for k in keywords):
            category = cat
            break

    # Urgency
    urgent_found = [k for k in URGENT_KEYWORDS if k in text]
    urgency_score = min(len(urgent_found) * 20, 100)

    # Priority (Base Business Logic)
    if category == "Billing" and any(word in text for word in ["charged", "payment", "refund"]):
        priority = "High"
    elif urgency_score >= 70:
        priority = "High"
    elif urgency_score >= 40:
        priority = "Medium"
    else:
        priority = "Low"

    # Billing issues are never low priority
    if category == "Billing" and priority == "Low":
        priority = "Medium"

    route_to = ROUTING.get(category, "General Support")

    try:
        allowed_sources = CATEGORY_DOC_MAP.get(category, [])
        retrieved_doc = retrieve_relevant_knowledge_v3(text, allowed_sources)
        suggested_response = generate_response_v3(text, retrieved_doc)
    except Exception:
        try:
            retrieved_doc = retrieve_relevant_knowledge_v2(text)
            suggested_response = generate_response_v2(text, retrieved_doc)
        except Exception:
            knowledge_base = load_knowledge_base()
            relevant_knowledge = retrieve_relevant_knowledge(text, knowledge_base)
            suggested_response = generate_response(text, relevant_knowledge)

    # 🔹 Knowledge Severity Influence
    knowledge_severity = detect_knowledge_severity(suggested_response)

    if knowledge_severity == "High":
        priority = "High"
    elif knowledge_severity == "Medium" and priority == "Low":
        priority = "Medium"

    # 🔹 Confidence Calibration
    if priority == "High" and knowledge_severity == "High":
        confidence = "High"
    elif priority in ["High", "Medium"] or knowledge_severity == "Medium":
        confidence = "Medium"
    else:
        confidence = "Low"
    
    # 🔹 Automatic Escalation
    escalate = False
    escalation_reason = None

    if priority == "High" and confidence == "High":
        escalate = True
        escalation_reason = "Critical issue detected by AI"

    return {
        "category": category,
        "urgency_score": urgency_score,
        "priority": priority,
        "route_to": route_to,
        "urgent_words": urgent_found,
        "suggested_response": suggested_response,
        "confidence": confidence,
        "escalate": escalate,
        "escalation_reason": escalation_reason
    }



