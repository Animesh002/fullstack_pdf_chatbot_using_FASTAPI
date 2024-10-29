import os
import logging
from typing import List
from fastapi import FastAPI, Depends, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from haystack.document_stores import InMemoryDocumentStore
from haystack.nodes import FARMReader, BM25Retriever
from haystack.pipelines import ExtractiveQAPipeline
from . import crud, models, schemas, database
import fitz  # PyMuPDF

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database tables are created
database.Base.metadata.create_all(bind=database.engine)

# Initialize Haystack components with BM25 support
document_store = InMemoryDocumentStore(use_bm25=True)
retriever = BM25Retriever(document_store=document_store)
reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2", use_gpu=True)
pipe = ExtractiveQAPipeline(reader, retriever)

# PDF text extraction function
def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text

# Add document to Haystack
def add_document_to_store(document_id: int, text: str):
    docs = [{"content": chunk, "meta": {"document_id": document_id}} for chunk in chunk_text(text)]
    document_store.write_documents(docs)

# Chunking function for large text content
def chunk_text(text: str, max_length: int = 300) -> List[str]:
    words = text.split()
    chunks = [" ".join(words[i:i + max_length]) for i in range(0, len(words), max_length)]
    return chunks

# Endpoint for uploading a PDF
@app.post("/upload/")
async def upload_pdf(file: UploadFile, db: Session = Depends(database.get_db)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    try:
        # Save the uploaded file
        file_path = f"./uploaded_files/{file.filename}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        contents = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(contents)

        # Extract and save text from the PDF
        extracted_text = extract_text_from_pdf(file_path)
        doc = crud.create_document(db, schemas.DocumentCreate(filename=file.filename, content=extracted_text))
        
        # Add the document to the Haystack document store
        add_document_to_store(doc.id, extracted_text)
        
        return {"document_id": doc.id, "filename": file.filename}
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Endpoint for asking a question
@app.post("/ask/")
async def ask_question(question: schemas.QuestionCreate, db: Session = Depends(database.get_db)):
    document = crud.get_document_by_id(db, question.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Run the question through the Haystack pipeline
    prediction = pipe.run(
        query=question.question_text,
        params={"Retriever": {"top_k": 5}, "Reader": {"top_k": 5}}  # Retrieve more answers and contexts
    )

    # Extract answer and context from prediction
    if prediction["answers"]:
        answer = " ".join([ans.answer for ans in prediction["answers"]])  # Concatenate answers into a paragraph
        context = " ".join([ans.context for ans in prediction["answers"]])  # Concatenate contexts if needed
    else:
        answer = "No answer found"
        context = ""

    return {
        "question": question.question_text,
        "answer": answer,
        "context": context  # Include context in the response
    }