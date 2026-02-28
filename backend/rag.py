from langchain_ollama import OllamaLLM
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

CHROMA_PATH = "chroma_db"
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = OllamaLLM(model="llama3")

def get_answer(question: str) -> dict:
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding)
    retriever = db.as_retriever(search_kwargs={"k": 3})
    
    docs = retriever.invoke(question)
    
    if not docs:
        return {
            "answer": "I don't have information on this in the current knowledge base.",
            "source": None
        }
    
    context = "\n\n".join([d.page_content for d in docs])
    source = docs[0].metadata.get("source", "Unknown")
    page = docs[0].metadata.get("page", "?")
    
    prompt = f"""You are CSIS SmartAssist, a helpful university department assistant.
Answer the question using only the context provided below.
If the answer is not in the context, say you don't have that information.

Context:
{context}

Question: {question}

Answer:"""
    
    answer = llm.invoke(prompt)
    return {
        "answer": answer,
        "source": f"{source}, p.{page}"
    }