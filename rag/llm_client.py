"""DeepSeek/Qwen LLM adapter entrypoint owned by member D."""
# rag/llm_client.py
"""
LLM Client Adapter
Owner: D
Supports DeepSeek and Qwen API providers.
API keys are read from environment variables only.
"""

import os
import logging
from abc import ABC, abstractmethod
from typing import Iterator, Optional
from datetime import datetime

import requests

logger = logging.getLogger(__name__)


class BaseLLMClient(ABC):
    """Abstract base class for LLM clients."""

    @abstractmethod
    def chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> str:
        """Send chat messages and return the response content."""
        pass

    @abstractmethod
    def stream_chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        """Stream chat response."""
        pass


class DeepSeekClient(BaseLLMClient):
    """DeepSeek API client."""

    API_BASE = "https://api.deepseek.com/v1"
    DEFAULT_MODEL = "deepseek-chat"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        self.model = model or self.DEFAULT_MODEL
        if not self.api_key:
            raise ValueError("DeepSeek API key not found. Set DEEPSEEK_API_KEY environment variable.")

    def chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        try:
            response = requests.post(
                f"{self.API_BASE}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except requests.RequestException as e:
            logger.error(f"DeepSeek API request failed: {e}")
            raise LLMProviderUnavailableError(f"DeepSeek API unavailable: {e}")

    def stream_chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }
        try:
            response = requests.post(
                f"{self.API_BASE}/chat/completions",
                headers=headers,
                json=payload,
                stream=True,
                timeout=60
            )
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    line = line.decode("utf-8")
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str == "[DONE]":
                            break
                        import json
                        chunk = json.loads(data_str)
                        delta = chunk["choices"][0]["delta"]
                        if "content" in delta:
                            yield delta["content"]
        except requests.RequestException as e:
            logger.error(f"DeepSeek streaming request failed: {e}")
            raise LLMProviderUnavailableError(f"DeepSeek API unavailable: {e}")


class QwenClient(BaseLLMClient):
    """Qwen (Alibaba DashScope) API client."""

    API_BASE = "https://dashscope.aliyuncs.com/api/v1"
    DEFAULT_MODEL = "qwen-turbo"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("QWEN_API_KEY")
        self.model = model or self.DEFAULT_MODEL
        if not self.api_key:
            raise ValueError("Qwen API key not found. Set QWEN_API_KEY environment variable.")

    def chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "input": {
                "messages": messages
            },
            "parameters": {
                "temperature": temperature,
                "max_tokens": max_tokens,
                "result_format": "message"
            }
        }
        try:
            response = requests.post(
                f"{self.API_BASE}/services/aigc/text-generation/generation",
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            if "output" in data and "choices" in data["output"]:
                return data["output"]["choices"][0]["message"]["content"]
            elif "output" in data and "text" in data["output"]:
                return data["output"]["text"]
            else:
                raise LLMProviderUnavailableError(f"Unexpected Qwen response format: {data}")
        except requests.RequestException as e:
            logger.error(f"Qwen API request failed: {e}")
            raise LLMProviderUnavailableError(f"Qwen API unavailable: {e}")

    def stream_chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        # Qwen streaming implementation (similar pattern)
        # For brevity, non-streaming fallback; can be extended
        yield self.chat(messages, temperature, max_tokens)


class MockLLMClient(BaseLLMClient):
    """
    Mock LLM client for development and testing.

    mock reason: API keys may not be available during early development.
    replacement plan: Replace with DeepSeekClient or QwenClient once API keys are configured.
    expected provider: deepseek
    """

    def __init__(self, model: str = "deepseek"):
        self.model = model
        logger.warning("Using MockLLMClient. Replace with real provider before production.")

    def chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> str:
        # Extract the last user message for context-aware mock response
        user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
        if "无法" in user_message or "NO_SOURCE" in user_message:
            return "根据当前知识库，无法找到足够可靠的资料来回答该问题。"
        return "这是开发阶段的模拟回答。请在配置 DeepSeek 或 Qwen API 后替换为真实模型输出。"

    def stream_chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        response = self.chat(messages, temperature, max_tokens)
        # Simulate streaming by yielding chunks
        chunk_size = 20
        for i in range(0, len(response), chunk_size):
            yield response[i:i + chunk_size]


class LLMProviderUnavailableError(Exception):
    """Raised when the LLM provider is unavailable."""
    pass


def get_llm_client(provider: str = "deepseek", api_key: Optional[str] = None) -> BaseLLMClient:
    """
    Factory function to get the appropriate LLM client.

    Args:
        provider: "deepseek", "qwen", or "mock"
        api_key: Optional API key override

    Returns:
        BaseLLMClient instance
    """
    provider = provider.lower()

    if provider == "mock":
        return MockLLMClient(model="deepseek")

    if provider == "deepseek":
        try:
            return DeepSeekClient(api_key=api_key)
        except ValueError:
            logger.warning("DeepSeek API key not found, falling back to mock.")
            return MockLLMClient(model="deepseek")

    if provider == "qwen":
        try:
            return QwenClient(api_key=api_key)
        except ValueError:
            logger.warning("Qwen API key not found, falling back to mock.")
            return MockLLMClient(model="qwen")

    raise ValueError(f"Unsupported LLM provider: {provider}. Use 'deepseek', 'qwen', or 'mock'.")
