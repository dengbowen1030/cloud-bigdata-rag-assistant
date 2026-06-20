# 本地启动说明

本文档给组员使用：从 `dev` 分支拉下代码后，按这里启动后端和前端，完成本地真实 API 测试。

## 1. 拉取 dev 分支

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant
git checkout dev
git pull origin dev
```

不要提交本地运行产物：

```text
.env
frontend/.env
data/*.db
models/
uploads/
vector_store/faiss_index/
frontend/node_modules/
frontend/dist/
```

## 2. 准备后端 .env

在项目根目录创建 `.env`。

示例：

```text
DATABASE_URL=sqlite:///D:/Agent_project/CodeX/temporary_job/cloud_data/big_project/cloud-bigdata-rag-assistant/data/edurag_stage2_real.db
UPLOAD_DIR=uploads/raw
UPLOAD_PROCESSED_DIR=uploads/processed
VECTOR_STORE_DIR=vector_store/faiss_index
RAG_EMBEDDING_MODE=real
RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
RAG_EMBEDDING_DOWNLOAD=0
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=填自己的 key，不要提交
QWEN_API_KEY=填自己的 key，不要提交
```

说明：

- `DATABASE_URL` 可以改成本机自己的 SQLite 绝对路径。
- `RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5` 会按项目根目录解析。
- 如果模型路径写绝对路径，也可以正常加载。
- 不要把真实 API Key 写进 GitHub、Issue、PR 或文档。

## 3. 准备前端 frontend/.env

在 `frontend/` 目录创建 `frontend/.env`。

示例：

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

说明：

- `VITE_USE_MOCK=false` 表示前端走真实后端。
- 如果后端端口改了，必须同步改 `VITE_API_BASE_URL`。
- `frontend/.env` 不要提交。

## 4. 启动后端

普通 Python 环境：

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant\backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

如果本机 `python` 不可用，可以使用 Codex bundled Python：

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant\backend
C:\Users\19866\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

启动后检查：

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

注意：不要用 `http://127.0.0.1:8000/` 判断后端是否正常，当前健康检查入口是 `/health`。

## 5. 启动前端

另开一个 PowerShell 窗口：

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant\frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

打开：

```text
http://127.0.0.1:5173
```

如果 PowerShell 拦截 `npm`，使用 `npm.cmd`。

## 6. 正确测试流程

1. 启动后端。
2. 启动前端。
3. 打开 `http://127.0.0.1:5173`。
4. 进入上传页面。
5. 上传 PDF、DOCX 或 TXT。
6. 进入知识库页面。
7. 找到刚上传的文档，点击“重建索引”。
8. 等待状态变成 `processed`。
9. 确认 `chunk_count > 0`。
10. 进入智能问答页面。
11. 输入问题，例如：`云计算的五个基本特征是什么？`
12. 检查是否返回 answer、model、created_at 和 sources。
13. 进入日志页面，确认有问答记录。
14. 进入统计页面，确认 document_count、chunk_count、question_count 有变化。

## 7. 常见问题

### 前端 Network Error

优先检查：

- 后端是否启动。
- 后端是否在 `http://127.0.0.1:8000`。
- `frontend/.env` 是否为 `VITE_API_BASE_URL=http://127.0.0.1:8000`。
- 后端终端是否有异常日志。

### 上传后不能直接问答

上传只生成 `Document` 记录，状态通常是 `uploaded`。必须点击“重建索引”，完成解析、切片、embedding 和 FAISS 索引后才能问答。

### 提问提示索引未准备好

如果没有生成 FAISS，后端会返回：

```text
VECTOR_INDEX_NOT_READY
```

解决方式：先上传文档并点击“重建索引”。

### 本地 embedding 模型不可用

如果看到类似提示：

```text
本地 embedding 模型不可用，请检查 models/bge-small-zh-v1.5 或 RAG_EMBEDDING_MODEL_PATH。
```

说明 `models/bge-small-zh-v1.5` 不存在，或者 `.env` 中路径写错。

## 8. 可选检查命令

后端测试：

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant
python -m unittest discover -s backend\tests -p "test_*.py"
```

前端构建：

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant\frontend
npm.cmd run build
```

## 删除文档验收

知识库页面删除文档时会调用：

```text
DELETE /documents/{document_id}
```

删除成功后，刷新知识库页面，该文档不应再出现。后端同时清理对应 chunks、原始上传文件、processed JSON，并用剩余 chunks 重建 FAISS。如果删除后没有任何可用 chunk，后端会清空 FAISS 文件，之后提问应提示 `VECTOR_INDEX_NOT_READY`。

删除不存在的文档时，后端应返回统一失败 envelope，错误码为 `DOCUMENT_NOT_FOUND`，前端应显示后端 message，而不是只显示 Network Error。
