# Cloud BigData RAG Assistant

EduRAG 是一个面向云计算与大数据课程资料的本地 RAG 问答系统。当前 `dev` 分支已经完成本地前后端真实 API 联调：用户可以上传课程资料、重建索引、进行智能问答，并查看问答日志和统计数据。

## 当前技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React + Vite + Ant Design |
| 后端 | FastAPI |
| RAG 编排 | LangChain |
| 向量索引 | FAISS |
| Embedding | bge-small-zh-v1.5 |
| 大模型接口 | DeepSeek API 或 Qwen API |
| 数据库 | 开发 SQLite，部署 PostgreSQL |
| 部署 | Docker Compose + Nginx |

## 当前能跑通的功能

- `POST /upload` 上传 PDF、DOCX、TXT。
- `GET /documents` 查看文档列表。
- `DELETE /documents/{document_id}` 删除已上传文档。
- `POST /documents/{document_id}/rebuild` 解析文档、切片、写入 chunks、生成 FAISS 索引。
- 上传成功后前端会自动尝试调用 `POST /documents/{document_id}/rebuild` 重建索引；如果自动重建失败，仍可在知识库页面手动点击“重建索引”。
- `POST /chat/query` 检索 FAISS、调用 DeepSeek/Qwen、返回答案和 sources。
- `GET /logs` 查看问答日志。
- `GET /stats` 查看文档数、切片数、问题数和最新提问时间。
- 前端在 `VITE_USE_MOCK=false` 时走真实 FastAPI 后端，不走 mock。

## 本地运行前提

需要准备：

- Python 3.11 或可用的 Codex bundled Python。
- Node.js 和 npm。
- 项目根目录 `.env`。
- 前端目录 `frontend/.env`。
- 本地 embedding 模型目录：`models/bge-small-zh-v1.5`。

不要提交这些本地运行产物：

```text
.env
data/*.db
models/
uploads/raw/
uploads/processed/
vector_store/faiss_index/
frontend/node_modules/
frontend/dist/
```

## 后端环境配置

项目根目录 `.env` 示例：

```text
DATABASE_URL=sqlite:///D:/Agent_project/CodeX/temporary_job/cloud_data/big_project/cloud-bigdata-rag-assistant/data/edurag_stage2_real.db
UPLOAD_DIR=uploads/raw
UPLOAD_PROCESSED_DIR=uploads/processed
VECTOR_STORE_DIR=vector_store/faiss_index
RAG_EMBEDDING_MODE=real
RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5
RAG_EMBEDDING_DOWNLOAD=0
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=不要写进文档或提交
QWEN_API_KEY=不要写进文档或提交
```

说明：

- `RAG_EMBEDDING_MODEL_PATH=models/bge-small-zh-v1.5` 会按项目根目录解析。
- 如果使用绝对路径，也可以写成 `D:/.../models/bge-small-zh-v1.5`。
- 不要把真实 API Key 写进 README、Issue、PR 或任何文档。

## 前端环境配置

`frontend/.env` 示例：

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

说明：

- `VITE_USE_MOCK=false` 表示前端必须调用真实后端。
- `VITE_API_BASE_URL` 必须指向正在运行的 FastAPI 地址。
- `frontend/.env` 不要提交。

## 启动后端

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

后端检查地址：

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

注意：`http://127.0.0.1:8000/` 不是健康检查入口。检查后端是否启动请访问 `/health` 或 `/docs`。

## 启动前端

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant\frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

前端访问地址：

```text
http://127.0.0.1:5173
```

如果 PowerShell 阻止 `npm`，请使用 `npm.cmd`。

## 本次前端工作内容

本次工作在不修改后端 API 契约的前提下，围绕课程演示和验收场景对前端进行精简与可读性优化。所有改动均属于 UI 表现层和前端交互层，不改变 API 路径、请求字段、响应 envelope，也不改变 `Document`、`ChatAnswer`、`RetrievedChunk`、`QaLog`、`Stats` 等核心对象字段。

### 1. 页面展示精简

为减少演示时的视觉干扰，前端新增“显示页面说明与接口标签”开关。默认情况下会隐藏以下辅助说明内容：

- 顶部页面标题左侧区域。
- 顶部面包屑，例如“云计算大数据知识库 / 上传中心”。
- 页面标题上方的接口说明，例如“上传接口”“文档列表接口”等。
- 页面标题下方的流程解释文字。
- 页面标签，例如 `PDF`、`DOCX`、`TXT`、`真实 API`、`Document`、`Rebuild`、`FAISS` 等。
- 顶部“真实接口 / 模拟接口”状态按钮。
- 左下角当前状态栏。

关闭说明内容后，页面头部图标和标题会保持居中排布，避免出现隐藏后布局偏移或视觉不居中的问题。

### 2. 系统设置功能

系统设置中新增用于演示精简的开关项：

- 显示页面说明与接口标签。
- 显示后恢复页面说明、接口标签、顶部接口状态和左下角状态栏。
- 隐藏后保留核心操作区域，使页面更适合课堂演示和验收截图。

该设置仅影响前端显示，不影响真实 API 调用和数据结构。

### 3. 顶部导航与通知中心

顶部区域已调整为以搜索栏为中心的简洁布局：

- 搜索栏居中显示，长度增加，方便在演示时突出检索入口。
- 通知中心按钮点击后显示通知小窗口。
- 通知中心用于展示系统活动、流程提醒、界面更新和当前状态说明。
- 通知内容仅用于前端提示，不写入后端数据库，不改变任何接口契约。

### 4. 知识库总览优化

知识库总览页面保留真实文档数据展示，同时降低默认信息密度：

- “文档总量 / 已处理 / 切片总量 / 需关注”等统计指标放入“知识库统计概览”折叠面板。
- 折叠面板初始为收起状态，用户需要查看时再展开。
- 折叠栏标题右侧不再显示额外说明文字，保持页面简洁。
- 文档列表保留 `status` 和 `chunk_count`，便于判断文档是否已经完成处理。

### 5. 文档删除与索引重建

知识库页面新增删除文件操作，调用现有接口：

```text
DELETE /documents/{document_id}
```

上传成功后，前端会自动尝试调用现有重建接口：

```text
POST /documents/{document_id}/rebuild
```

如果自动重建失败，用户仍然可以在知识库总览页面点击“重建索引”进行手动重试。该设计不会新增接口，也不会修改请求字段或返回结构。

### 6. 契约保持说明

本次前端工作保持以下规则不变：

- `VITE_USE_MOCK=false` 时仍然走真实 FastAPI 后端。
- `VITE_API_BASE_URL` 仍然是唯一的前端后端地址配置。
- 上传文件类型仍然限制为 PDF、DOCX、TXT。
- API 响应仍然使用 `success / data / message / error_code` 统一 envelope。
- Chat 页面仍然展示 `answer`、`model`、`created_at` 和 `sources`。
- Sources 仍然展示 `filename`、`page`、`chunk_index`、`score`、`preview`。
- Logs 页面仍然展示 `question`、`answer`、`source_count`、`model`、`created_at`。
- Dashboard 页面仍然展示 `document_count`、`chunk_count`、`question_count`、`latest_question_time`。

## 正确操作流程

1. 启动后端。
2. 启动前端。
3. 打开 `http://127.0.0.1:5173`。
4. 在上传页面上传 PDF、DOCX 或 TXT。
5. 上传成功后，前端会自动尝试重建索引。
6. 进入知识库页面，查看文档 `status` 和 `chunk_count`。
7. 如果自动重建成功，等待文档状态变成 `processed`，并确认 `chunk_count > 0`。
8. 如果自动重建失败，可在知识库页面点击对应文档的“重建索引”手动重试。
9. 进入智能问答页面提问。
10. 查看答案、模型、创建时间和 sources。
11. 进入日志页面查看问答日志。
12. 进入统计页面查看文档数、切片数、问题数和最新提问时间。

## 测试入口 URL

```text
前端首页：http://127.0.0.1:5173
后端健康检查：http://127.0.0.1:8000/health
后端 Swagger：http://127.0.0.1:8000/docs
上传页面：http://127.0.0.1:5173/upload
知识库页面：http://127.0.0.1:5173/knowledge-base
智能问答页面：http://127.0.0.1:5173/chat
日志页面：http://127.0.0.1:5173/logs
统计页面：http://127.0.0.1:5173/dashboard
```

## 常见问题

### `127.0.0.1:8000` 打不开

通常是后端没有启动，或者端口不是 8000。请先访问：

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

### 前端显示 Network Error

常见原因：

- 后端没有启动。
- 后端端口不是 8000。
- `frontend/.env` 里的 `VITE_API_BASE_URL` 配错。
- 后端返回裸异常。当前代码应尽量用统一 envelope 返回错误，如果仍出现请先看后端终端日志。

### 上传后为什么还是 `uploaded`

上传成功只表示文件已保存并创建 `Document` 记录，不表示已经解析、切片和向量化。必须到知识库页面点击“重建索引”。

### 没有重建索引就提问

可能返回：

```text
VECTOR_INDEX_NOT_READY
```

或前端提示“请先上传文档并重建索引”。

### 模型目录不存在

如果 `models/bge-small-zh-v1.5` 不存在，且 `RAG_EMBEDDING_MODE=real`、`RAG_EMBEDDING_DOWNLOAD=0`，真实 embedding 不能运行。请先准备本地模型目录。

### 运行产物不要提交

不要提交：

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

## 接口与协作规范

- API 契约来源：`docs/module_contracts.md`
- API 设计说明：`docs/api_design.md`
- 本地启动说明：`docs/local_startup.md`
- 前端改写约束：`docs/frontend_guidelines.md`

任何人修改 API 路径、请求字段、响应字段或 error_code，都必须同步更新 `docs/module_contracts.md` 和 `docs/api_design.md`。

## 删除文档行为

知识库页面的删除操作调用 `DELETE /documents/{document_id}`。删除成功后，后端会删除 `documents` 记录、对应 `chunks`、原始上传目录和 processed JSON，并用数据库中剩余 chunks 重新生成 FAISS 索引。

如果删除后没有任何 chunk，后端会清空 `vector_store/faiss_index/index.faiss` 和 `metadata.json`。此时继续提问应返回 `VECTOR_INDEX_NOT_READY` 或等价的无索引提示，而不是继续引用已删除文档。

删除不存在的文档不会返回裸 500，而是统一 envelope：

```json
{
  "success": false,
  "data": null,
  "message": "Document not found.",
  "error_code": "DOCUMENT_NOT_FOUND"
}
```
