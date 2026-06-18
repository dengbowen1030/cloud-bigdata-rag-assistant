from sqlalchemy import Column, Integer, String, Text

from app.database.session import Base


class ChunkModel(Base):
    __tablename__ = "chunks"

    chunk_id = Column(String, primary_key=True, index=True)
    document_id = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    page = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=False)
    created_at = Column(String, nullable=False)
