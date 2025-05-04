from http.client import HTTPException
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import os
import psycopg2
from pgvector.psycopg2 import register_vector
import logging
from PyPDF2 import PdfReader

# Initialize FastAPI
app = FastAPI()

# Load the model once
MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)

# Connect to Postgres
conn = psycopg2.connect(dsn="postgresql://postgres:password@postgres:5432/ragdb")
register_vector(conn)

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

class EmbedRequest(BaseModel):
    text: str

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

class Message(BaseModel):
    detail: str

@app.get("/")
def index():
    return "hello"

@app.post("/embed")
def embed_text(req: EmbedRequest):
    embedding = model.encode(req.text).tolist()
    cur = conn.cursor()
    cur.execute(f"insert into documents (content, embedding) values (%s, %s)", (req.text, embedding))
    conn.commit()
    return {"embedding": embedding}

@app.post("/search")
def search_text(req: SearchRequest):
    cur = conn.cursor()
    query_embedding = model.encode(req.query).tolist()
    cur.execute(
        "SELECT id, content FROM documents ORDER BY embedding <-> %s::vector LIMIT %s",
        (query_embedding, req.top_k)
    )
    rows = cur.fetchall()
    contents = [{"id": str(row[0]), "content": row[1]} for row in rows]
    return {"results": contents}

@app.post("/upload-pdf", response_model=Message)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF files are allowed.")

    try:
        contents = await file.read()
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as f:
            f.write(contents)

        chunks = load_and_chunk_pdf(temp_file_path)
        embeddings = generate_embeddings(chunks, model)

        try:
            store_embeddings(conn, chunks, embeddings)
            return {"detail": f"Successfully processed '{file.filename}' and stored embeddings in PostgreSQL."}
        except psycopg2.Error as e:
            raise HTTPException(status_code=500, detail=f"Database error: {e}")
        finally:
            os.remove(temp_file_path)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

def load_and_chunk_pdf(pdf_path, chunk_size=500, chunk_overlap=50):
    try:
        with open(pdf_path, 'rb') as pdf_file:
            reader = PdfReader(pdf_file)
            text = ""

            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text.replace('\x00', '') + "\n"

            chunks = []
            start = 0
            
            while start < len(text):
                end = min(start + chunk_size, len(text))
                chunk = text[start:end]
                chunks.append(chunk)
                start += chunk_size - chunk_overlap
            
            return chunks
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {pdf_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {e}")

def generate_embeddings(chunks, model):
    embeddings = model.encode(chunks)
    return embeddings

def store_embeddings(conn, chunks, embeddings):
    cur = conn.cursor()
    try:
        for chunk, embedding in zip(chunks, embeddings):
            cur.execute("INSERT INTO documents (content, embedding) VALUES (%s, %s)", (chunk, embedding))
        conn.commit()
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error storing embeddings: {e}")
    finally:
        cur.close()
