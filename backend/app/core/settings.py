from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Cloud BigData RAG Assistant API"
    default_llm_provider: str = "deepseek"


settings = Settings()

