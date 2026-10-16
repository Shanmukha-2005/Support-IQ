import os

def load_support_documents():
    """
    Loads all .txt files from data/support_docs/
    Returns a list of dictionaries:
    [
        {"source": "billing.txt", "content": "..."},
        ...
    ]
    """
    base_dir = os.path.dirname(os.path.dirname(__file__))
    docs_path = os.path.join(base_dir, "data", "support_docs")

    documents = []

    for filename in os.listdir(docs_path):
        if filename.endswith(".txt"):
            file_path = os.path.join(docs_path, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read().strip()
                documents.append({
                    "source": filename,
                    "content": text
                })

    return documents
