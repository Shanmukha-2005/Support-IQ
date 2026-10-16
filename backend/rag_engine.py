from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from document_loader import load_support_documents
from multi_doc_retriever import retrieve_from_documents
from vector_store import build_faiss_index, search_faiss
from transformers import pipeline

import os

_llm = None

def get_llm():
    global _llm
    if _llm is None:
        _llm = pipeline("text2text-generation", model="google/flan-t5-small")
    return _llm

def load_knowledge_base():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    kb_path = os.path.join(base_dir, "data", "knowledge_base.txt")

    with open(kb_path, "r", encoding="utf-8") as f:
        return f.readlines()


def retrieve_relevant_knowledge(ticket, knowledge_lines):
    documents = knowledge_lines + [ticket]

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(documents)

    similarities = cosine_similarity(tfidf[-1], tfidf[:-1])[0]
    best_index = similarities.argmax()

    return knowledge_lines[best_index].strip()

def generate_response(ticket, knowledge):
    return (
        f"Based on the issue described, here is a suggested resolution:\n\n"
        f"{knowledge}"
    )

def retrieve_relevant_knowledge_v2(ticket_text):
    """
    New retrieval logic using structured support documents.
    Returns content + source.
    """
    documents = load_support_documents()
    best_match = retrieve_from_documents(ticket_text, documents)
    return best_match

def generate_response_v2(ticket_text, retrieved_doc):
    """
    Still NOT an LLM.
    Just formats retrieved knowledge professionally.
    """
    return (
        "Based on the issue described, here is the relevant information:\n\n"
        f"{retrieved_doc['content']}\n\n"
        f"Source: {retrieved_doc['source']}"
    )

def retrieve_relevant_knowledge_v3(ticket_text, allowed_sources=None):
    documents = load_support_documents()

    if allowed_sources:
        documents = [
            doc for doc in documents
            if doc["source"] in allowed_sources
        ]

    index, docs = build_faiss_index(documents)
    results = search_faiss(ticket_text, index, docs)
    return results[0]

def generate_response_v3(ticket_text, retrieved_doc):
    llm = get_llm()

    prompt = f"""
You are a professional customer support agent.

Respond politely and clearly to the customer.
Use ONLY the information provided below.
Do NOT invent information.
If the knowledge is insufficient, say the issue will be escalated.

Support Knowledge:
{retrieved_doc['content']}

Customer Issue:
{ticket_text}

Helpful Response:
"""

    output = llm(prompt, max_new_tokens=200)
    answer = output[0]["generated_text"].strip()

    return f"{answer}\n\nSource: {retrieved_doc['source']}"
