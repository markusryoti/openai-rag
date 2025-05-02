from fastapi import FastAPI, UploadFile, File
# from fastapi.logger import logger
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import io
import traceback
import psycopg2
from pgvector.psycopg2 import register_vector
import pdfplumber
import logging

# Initialize FastAPI
app = FastAPI()

# Load the model once
model = SentenceTransformer('all-MiniLM-L6-v2')

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

def split_text(text, max_length=800, overlap=200):
    chunks = []
    start = 0

    while start < len(text):
        end = start + max_length
        if end > len(text):
            end = len(text)

        chunk = text[start:end]

        # Try not to cut in middle of sentence
        if end < len(text):
            last_period = chunk.rfind('.')
            if last_period > 0.5 * max_length:
                chunk = chunk[:last_period + 1]
                end = start + len(chunk)

        chunks.append(chunk.strip())

        next_start = end - overlap
        if next_start <= start:
            next_start = start + 1  # ensure progress

        start = next_start

    return chunks


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
        "SELECT content FROM documents ORDER BY embedding <-> %s::vector LIMIT %s",
        (query_embedding, req.top_k)
    )
    rows = cur.fetchall()
    contents = [row[0] for row in rows]
    return {"results": contents}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        logger.info("starting to read file")

        contents = await file.read()

        logger.info("contents read")

        full_text = ""

        # Parse PDF
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                full_text += page.extract_text() + "\n"

        logger.info("text extracted")

        # Split into chunks
        chunks = split_text(full_text)

        logger.info("chunks created")

        # Insert into database
        cur = conn.cursor()

        for chunk in chunks:
            embedding = model.encode(chunk).tolist()
            cur.execute(
                "INSERT INTO documents (content, embedding) VALUES (%s, %s)",
                (chunk, embedding)
            )

        logger.info("insert commands done, committing tx")

        conn.commit()

        return {"message": f"Uploaded and indexed {len(chunks)} chunks from PDF"}

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

