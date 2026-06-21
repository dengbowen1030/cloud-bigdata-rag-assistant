# 本地开发启动说明

本文档用于开发调试。如果只需要运行部署版，优先查看 `README.md` 和 `docs/deployment_guide.md` 中的 Docker Compose 部署方式。

## 1. 拉取代码

```powershell
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

## 2. 后端环境变量

在项目根目录创建 `.env`，可以从 `.env.example` 复制：

```powershell
copy .env.example .env
```

本地开发示例：

```text
DATABASE_URL=sqlite:///./data/edurag.db
UPLOAD_DIR=uploads/raw
UPLOAD_PROCESSED_DIR=uploads/processed
VECTOR_STORE_DIR=vector_store/faiss_index
RAG_EMBEDDING_MODE=real
RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
RAG_EMBEDDING_DOWNLOAD=0
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=填写自己的 key，不要提交
QWEN_API_KEY=
```

说明：

- `DATABASE_URL` 可以使用相对路径，也可以按需要改成本机自己的 SQLite 绝对路径。
- `RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5` 会按项目根目录解析。
- 不要把真实 API Key 写进 GitHub、Issue、PR 或文档。

## 3. 前端环境变量

在 `frontend/` 目录创建 `frontend/.env`：

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

说明：

- `VITE_USE_MOCK=false` 表示前端调用真实后端。
- 如果后端端口变化，需要同步修改 `VITE_API_BASE_URL`。
- `frontend/.env` 不要提交。

## 4. 启动后端

从项目根目录进入后端目录：

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

如果本机 `python` 不可用，可以换成可用的 Python 解释器路径：

```powershell
cd backend
<python.exe 的实际路径> -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

启动后检查：

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

## 5. 启动前端

另开一个 PowerShell 窗口，从项目根目录进入前端目录：

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

打开：

```text
http://127.0.0.1:5173
```

如果 PowerShell 拦截 `npm`，使用 `npm.cmd`。

## 6. 测试流程

1. 启动后端。
2. 启动前端。
3. 打开 `http://127.0.0.1:5173`。
4. 上传 PDF、DOCX 或 TXT。
5. 进入知识库页面。
6. 点击“重建索引”。
7. 等待状态变成 `processed`。
8. 确认 `chunk_count > 0`。
9. 进入智能问答页面。
10. 输入课程相关问题。
11. 检查是否返回 answer、model、created_at 和 sources。
12. 进入日志页面，确认有问答记录。
13. 进入统计页面，确认 document_count、chunk_count、question_count 有变化。
14. 删除一个文档，确认知识库列表和 sources 不再引用该文档。

## 7. 常见问题

### 前端显示 Network Error

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

## 8. 检查命令

后端测试：

```powershell
python -m unittest discover -s backend\tests -p "test_*.py"
```

前端构建：

```powershell
cd frontend
npm.cmd run build
```

## 9. 删除文档验收

知识库页面删除文档时会调用：

```text
DELETE /documents/{document_id}
```

删除成功后：

- `GET /documents` 不再返回该文档。
- 后端清理对应 chunks、原始上传文件、processed JSON。
- 后端用剩余 chunks 重建 FAISS。
- 如果没有任何可用 chunk，后端会清空 FAISS 文件，之后提问应提示 `VECTOR_INDEX_NOT_READY`。

删除不存在的文档时，后端返回统一失败 envelope，错误码为 `DOCUMENT_NOT_FOUND`。
