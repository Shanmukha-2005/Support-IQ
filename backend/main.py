from fastapi import FastAPI
from pydantic import BaseModel
from ticket_ai import analyze_ticket
from store import save_ticket, get_all_tickets, update_ticket_status
from email_utils import send_ticket_email
from store import update_ticket_feedback
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SupportIQ API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # React
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SupportIQ backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

class TicketRequest(BaseModel):
    ticket: str
    email: str

@app.post("/analyze")
def analyze(request: TicketRequest):
    print("📩 Analyze API called")
    print("Ticket received:", request.ticket)

    result = analyze_ticket(request.ticket)

    saved_ticket = save_ticket({
        "ticket": request.ticket,
        **result
    })

    try:
        send_ticket_email(
            to_email=request.email,
            ticket_text=request.ticket,
            ticket=saved_ticket
        )
    except Exception as e:
        print("⚠️ Email failed:", e)

    return saved_ticket

@app.get("/admin/tickets")
def get_tickets():
    return get_all_tickets()

class StatusUpdate(BaseModel):
    ticket_id: str
    status: str

@app.post("/admin/update-status")
def update_status(request: StatusUpdate):
    updated = update_ticket_status(request.ticket_id, request.status)
    if not updated:
        return {"error": "Ticket not found"}
    return updated

@app.get("/feedback")
def feedback(ticket_id: str, response: str):
    if response not in ["helpful", "not_helpful"]:
        return {"error": "Invalid feedback"}

    updated = update_ticket_feedback(ticket_id, response)

    if not updated:
        return {"error": "Ticket not found"}

    return HTMLResponse(
        content=f"""
        <h3>Thank you for your feedback!</h3>
        <p>Your response: <b>{response.replace('_', ' ')}</b></p>
        <p>Our support team will review your ticket.</p>
        """
    )