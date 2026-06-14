from fastapi import FastAPI

from app.api.routes import (
    chat_router,
    documents_router,
    health_router,
    logs_router,
    stats_router,
)
from app.core.settings import settings

app = FastAPI(title=settings.app_name)

app.include_router(health_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(logs_router)
app.include_router(stats_router)
