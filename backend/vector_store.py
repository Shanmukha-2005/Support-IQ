import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load embedding model once
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def build_faiss_index(documents):
    """
    documents: list of dicts with keys -> content, source
    Returns FAISS index + document mapping
    """
    texts = [doc["content"] for doc in documents]
    embeddings = embedding_model.encode(texts)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype("float32"))

    return index, documents


def search_faiss(ticket_text, index, documents, top_k=1):
    """
    Returns top_k relevant documents
    """
    query_embedding = embedding_model.encode([ticket_text])
    distances, indices = index.search(
        np.array(query_embedding).astype("float32"),
        top_k
    )

    results = []
    for idx in indices[0]:
        results.append(documents[idx])

    return results
