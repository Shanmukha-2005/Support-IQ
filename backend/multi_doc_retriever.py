from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def retrieve_from_documents(ticket_text, documents):
    """
    ticket_text: str
    documents: list of dicts from document_loader
    Returns best matching document (content + source)
    """

    contents = [doc["content"] for doc in documents]
    sources = [doc["source"] for doc in documents]

    all_texts = contents + [ticket_text]

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(all_texts)

    similarity_scores = cosine_similarity(
        tfidf_matrix[-1],
        tfidf_matrix[:-1]
    )[0]

    best_index = similarity_scores.argmax()

    return {
        "source": sources[best_index],
        "content": contents[best_index]
    }
