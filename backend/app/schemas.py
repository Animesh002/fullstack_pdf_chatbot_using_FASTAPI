from pydantic import BaseModel

class DocumentCreate(BaseModel):
    filename: str
    content: str

class QuestionCreate(BaseModel):
    document_id: int
    question_text: str
