from typing import Any, Optional


def success_response(data: Any = None, message: str = "") -> dict:
    return {
        "success": True,
        "data": data,
        "message": message,
        "error_code": None,
    }


def failure_response(message: str, error_code: str, data: Optional[Any] = None) -> dict:
    return {
        "success": False,
        "data": data,
        "message": message,
        "error_code": error_code,
    }

