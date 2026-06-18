"""DeepSeek/Qwen LLM adapter.

API keys are read from environment variables only. Never log full keys.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterator
import logging
import os

import requests

logger = logging.getLogger(__name__)


class LLMProviderUnavailableError(Exception):
    """Raised when the selected LLM provider cannot answer."""


class BaseLLMClient(ABC):
    provider: str
    mode: str

    @abstractmethod
    def chat(self, messages: list[dict], temperature: float = 0.3, max_tokens: int = 2048) -> str:
        """Return assistant text for chat messages."""

    def stream_chat(self, messages: list[dict], temperature: float = 0.3, max_tokens: int = 2048) -> Iterator[str]:
        yield self.chat(messages=messages, temperature=temperature, max_tokens=max_tokens)


class DeepSeekClient(BaseLLMClient):
    API_BASE = "https://api.deepseek.com/v1"
    DEFAULT_MODEL = "deepseek-chat"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self.provider = "deepseek"
        self.mode = "real"
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        self.model = model or self.DEFAULT_MODEL
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_KEY is not configured.")

    def chat(self, messages: list[dict], temperature: float = 0.3, max_tokens: int = 2048) -> str:
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        try:
            response = requests.post(
                f"{self.API_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=60,
            )
            response.raise_for_status()
            data = response.json()
            return str(data["choices"][0]["message"]["content"]).strip()
        except (KeyError, IndexError, TypeError, requests.RequestException) as exc:
            logger.error("DeepSeek API request failed without exposing API key: %s", exc)
            raise LLMProviderUnavailableError(f"DeepSeek API unavailable: {exc}") from exc


class QwenClient(BaseLLMClient):
    API_BASE = "https://dashscope.aliyuncs.com/api/v1"
    DEFAULT_MODEL = "qwen-turbo"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self.provider = "qwen"
        self.mode = "real"
        self.api_key = api_key or os.getenv("QWEN_API_KEY")
        self.model = model or self.DEFAULT_MODEL
        if not self.api_key:
            raise ValueError("QWEN_API_KEY is not configured.")

    def chat(self, messages: list[dict], temperature: float = 0.3, max_tokens: int = 2048) -> str:
        payload = {
            "model": self.model,
            "input": {"messages": messages},
            "parameters": {
                "temperature": temperature,
                "max_tokens": max_tokens,
                "result_format": "message",
            },
        }
        try:
            response = requests.post(
                f"{self.API_BASE}/services/aigc/text-generation/generation",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=60,
            )
            response.raise_for_status()
            data = response.json()
            choices = data.get("output", {}).get("choices")
            if choices:
                return str(choices[0]["message"]["content"]).strip()
            text = data.get("output", {}).get("text")
            if text:
                return str(text).strip()
            raise KeyError("output.choices[0].message.content")
        except (KeyError, IndexError, TypeError, requests.RequestException) as exc:
            logger.error("Qwen API request failed without exposing API key: %s", exc)
            raise LLMProviderUnavailableError(f"Qwen API unavailable: {exc}") from exc


class MockLLMClient(BaseLLMClient):
    def __init__(self, provider: str = "deepseek") -> None:
        self.provider = provider if provider in {"deepseek", "qwen"} else "deepseek"
        self.mode = "mock"
        logger.warning("Using MockLLMClient because a real API key is not configured.")

    def chat(self, messages: list[dict], temperature: float = 0.3, max_tokens: int = 2048) -> str:
        user_text = ""
        for message in reversed(messages):
            if message.get("role") == "user":
                user_text = str(message.get("content") or "")
                break
        if "NO_RELIABLE_SOURCE" in user_text:
            return "根据当前知识库，无法找到足够可靠的资料来回答该问题。"
        return "根据已检索到的课程资料，云计算的基本特征包括按需自助服务、广泛的网络访问、资源池化、快速弹性伸缩和可计量服务。"


def get_llm_client(provider: str = "deepseek", api_key: str | None = None) -> BaseLLMClient:
    normalized = (provider or "deepseek").lower()
    if normalized == "mock":
        return MockLLMClient(provider="deepseek")
    if normalized == "deepseek":
        try:
            return DeepSeekClient(api_key=api_key)
        except ValueError:
            return MockLLMClient(provider="deepseek")
    if normalized == "qwen":
        try:
            return QwenClient(api_key=api_key)
        except ValueError:
            return MockLLMClient(provider="qwen")
    raise ValueError(f"Unsupported LLM provider: {provider}. Use 'deepseek', 'qwen', or 'mock'.")
