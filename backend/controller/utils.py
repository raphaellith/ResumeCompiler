from fastapi import Request
from fastapi.responses import JSONResponse

from backend.controller.allowed_origins import ALLOWED_ORIGINS


def _get_error_response(request: Request, exc: Exception) -> JSONResponse:
    error_type = type(exc).__name__
    error_message = str(exc)

    response = JSONResponse(
        status_code=500,
        content={
            "error": error_type,
            "message": error_message,
        },
    )
    _add_cors_headers_to_response(response, request)

    return response


def _add_cors_headers_to_response(response: JSONResponse, request: Request):
    origin = request.headers.get("origin")
    if origin not in ALLOWED_ORIGINS:
        return

    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
