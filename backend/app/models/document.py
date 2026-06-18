from sqlalchemy import Column, Integer, String

from app.database.session import Base


class DocumentModel(Base):
    __tablename__ = "documents"

    document_id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    chunk_count = Column(Integer, nullable=False, default=0)
    created_at = Column(String, nullable=False)
