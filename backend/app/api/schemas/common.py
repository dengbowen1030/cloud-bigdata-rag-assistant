from typing import Any, Optional

from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str = ""
    error_code: Optional[str] = None

