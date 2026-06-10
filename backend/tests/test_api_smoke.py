import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def assert_envelope(test_case, payload):
    test_case.assertEqual(set(payload.keys()), {"success", "data", "message", "error_code"})


class ApiSmokeTest(unittest.TestCase):
    def test_health_uses_unified_response(self):
        response = client.get("/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        assert_envelope(self, payload)
        self.assertTrue(payload["success"])
        self.assertEqual(payload["data"], {"status": "ok"})
        self.assertIsNone(payload["error_code"])

    def test_documents_list_uses_unified_response(self):
        response = client.get("/documents")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        assert_envelope(self, payload)
        self.assertTrue(payload["success"])
        self.assertIsInstance(payload["data"], list)

    def test_chat_query_no_source_placeholder(self):
        response = client.post("/chat/query", json={"question": "软件开发周期是什么？", "top_k": 5})

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        assert_envelope(self, payload)
        self.assertTrue(payload["success"])
        self.assertEqual(payload["data"]["question"], "软件开发周期是什么？")
        self.assertEqual(payload["data"]["sources"], [])

    def test_stats_uses_contract_shape(self):
        response = client.get("/stats")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        assert_envelope(self, payload)
        self.assertTrue(payload["success"])
        self.assertEqual(
            set(payload["data"].keys()),
            {
                "document_count",
                "chunk_count",
                "question_count",
                "latest_question_time",
            },
        )


if __name__ == "__main__":
    unittest.main()
