from .chat import router as chat_router
from .documents import router as documents_router
from .health import router as health_router
from .logs import router as logs_router
from .stats import router as stats_router

__all__ = [
    "chat_router",
    "documents_router",
    "health_router",
    "logs_router",
    "stats_router",
]

