import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

SENDER_EMAIL = os.getenv("SENDER_EMAIL", "")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")

def send_ticket_email(to_email, ticket_text, ticket):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("⚠️ SENDER_EMAIL or SENDER_PASSWORD not configured. Skipping email delivery.")
        return

    subject = f"[SupportIQ] Ticket Received – {ticket['category']}"

    feedback_helpful = (
        f"http://127.0.0.1:8000/feedback"
        f"?ticket_id={ticket['ticket_id']}&response=helpful"
    )
    feedback_not = (
        f"http://127.0.0.1:8000/feedback"
        f"?ticket_id={ticket['ticket_id']}&response=not_helpful"
    )

    body = f"""
Hello,

Your support ticket has been received successfully.

📌 Category: {ticket['category']}
🚦 Priority: {ticket['priority']}
👥 Routed To: {ticket['route_to']}
⏱ Urgency Score: {ticket['urgency_score']}/100

📝 Issue:
{ticket_text}

💡 Suggested Response:
{ticket.get('suggested_response', 'Our team will get back to you shortly.')}

-----------------------------------
Was this response helpful?

👍 Yes: {feedback_helpful}
👎 No: {feedback_not}
-----------------------------------

Regards,
SupportIQ Team
"""

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    server.send_message(msg)
    server.quit()
