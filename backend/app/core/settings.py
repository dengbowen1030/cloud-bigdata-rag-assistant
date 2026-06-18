import os
from pathlib import Path

from pydantic import BaseModel

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - python-dotenv is expected in backend requirements
    load_dotenv = None


PROJECT_ROOT = Path(__file__).resolve().parents[3]
if load_dotenv is not None:
    load_dotenv(PROJECT_ROOT / ".env", override=False)

DEFAULT_DATABASE_PATH = PROJECT_ROOT / "data" / "edurag.db"
DEFAULT_UPLOAD_DIR = PROJECT_ROOT / "uploads" / "raw"
DEFAULT_PROCESSED_DIR = PROJECT_ROOT / "uploads" / "processed"
DEFAULT_VECTOR_STORE_DIR = PROJECT_ROOT / "vector_store" / "faiss_index"
DEFAULT_EMBEDDING_MODEL_PATH = PROJECT_ROOT / "models" / "bge-small-zh-v1.5"


def resolve_project_path(value: str | Path) -> str:
    path = Path(value)
    if path.is_absolute():
        return str(path)
    return str(PROJECT_ROOT / path)


class Settings(BaseModel):
    app_name: str = "Cloud BigData RAG Assistant API"
    default_llm_provider: str = "deepseek"
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}")
    upload_dir: str = resolve_project_path(os.getenv("UPLOAD_DIR", str(DEFAULT_UPLOAD_DIR)))
    processed_dir: str = resolve_project_path(os.getenv("UPLOAD_PROCESSED_DIR", str(DEFAULT_PROCESSED_DIR)))
    vector_store_dir: str = resolve_project_path(os.getenv("VECTOR_STORE_DIR", str(DEFAULT_VECTOR_STORE_DIR)))
    rag_embedding_mode: str = os.getenv("RAG_EMBEDDING_MODE", "real")
    rag_embedding_model_path: str = resolve_project_path(os.getenv("RAG_EMBEDDING_MODEL_PATH", str(DEFAULT_EMBEDDING_MODEL_PATH)))
    rag_embedding_download: str = os.getenv("RAG_EMBEDDING_DOWNLOAD", "0")
    llm_provider: str = os.getenv("LLM_PROVIDER", os.getenv("DEFAULT_LLM_PROVIDER", "deepseek")).lower()


settings = Settings()
