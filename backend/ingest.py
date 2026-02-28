from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

CHROMA_PATH = "chroma_db"
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def ingest_pdf(filepath: str, filename: str):
    reader = PdfReader(filepath)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            pages.append({
                "text": text,
                "metadata": {"source": filename, "page": i + 1}
            })
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = []
    metadatas = []
    for p in pages:
        splits = splitter.split_text(p["text"])
        chunks.extend(splits)
        metadatas.extend([p["metadata"]] * len(splits))
    
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding)
    db.add_texts(chunks, metadatas=metadatas)
    print(f"Ingested {len(chunks)} chunks from {filename}")