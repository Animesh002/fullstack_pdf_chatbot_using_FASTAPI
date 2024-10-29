from .models import Document
from .schemas import DocumentCreate
from sqlalchemy.orm import Session

def create_document(db: Session, document: DocumentCreate):
    db_doc = Document(filename=document.filename, content=document.content)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

def get_document_by_id(db: Session, doc_id: int):
    return db.query(Document).filter(Document.id == doc_id).first()
