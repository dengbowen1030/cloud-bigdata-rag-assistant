from sqlalchemy import Column, Integer, String, Text

from app.database.session import Base


class QaLogModel(Base):
    __tablename__ = "qa_logs"

    log_id = Column(String, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    source_count = Column(Integer, nullable=False, default=0)
    model = Column(String, nullable=False)
    created_at = Column(String, nullable=False)
