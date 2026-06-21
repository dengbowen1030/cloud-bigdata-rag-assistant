# Cloud BigData RAG Assistant / EduRAG

EduRAG 是一个面向“云计算与大数据”课程资料的本地 RAG 智能问答系统。用户上传课程资料后，系统会完成文档解析、文本切片、Embedding 向量化、FAISS 检索，并调用 DeepSeek 或 Qwen 生成带来源的答案。

本仓库可以直接作为 GitHub 演示页面使用。演讲建议顺序是：

```text
小组成员分工 -> Docker Compose 部署 -> 系统总体架构 -> RAG 问答流程 -> 功能演示与评估证据
```

## 1. 小组成员分工

图：项目按照后端、文档处理、向量检索、RAG 问答和前端联调拆分，成员之间通过固定的数据契约交接。

![成员分工与模块协作图](<photo/图 4：成员分工与模块协作图.png>)

| 成员 | 角色 | 主要工作 |
|---|---|---|
| A：邓博文 | 项目统筹、后端 API、GitHub 协作、最终演示 | 项目整体规划；GitHub Issue / Project 管理；FastAPI 后端接口骨架；API 契约与模块契约；集成验收；Docker Compose 部署验收；GitHub 演示与答辩。 |
| B：李嘉杰 | 文档处理、文本解析、切片、Markdown 文档整理 | PDF / DOCX / TXT 文档解析；文本清洗；`Chunk[]` 切片；文档入库；部分 Markdown 文档整理与说明；协助报告材料整理。 |
| C：张乔文 | Embedding、FAISS 向量库、检索模块 | 接入 `bge-small-zh-v1.5`；向量生成；FAISS 索引构建；Top-K 检索；输出 `RetrievedChunk[]`；检索测试与向量库说明。 |
| D：张周伟 | LLM Adapter、RAG 问答链路 | DeepSeek / Qwen API 调用适配；RAG 问答链路；Prompt 组织；`ChatAnswer` 输出；无可靠来源时拒答；问答日志写入。 |
| E：柴成员 | 前端页面与接口联调 | React + Vite + Ant Design 前端；上传页面；知识库页面；智能问答页面；日志与统计页面；前后端接口联调；页面展示优化。 |

## 2. Docker Compose 本机部署

图：Docker Compose 使用 Nginx 作为统一入口，前端静态资源由 Nginx 托管，`/api` 请求反向代理到 FastAPI 后端。

![Docker Compose 部署架构图](<photo/图 3：Docker Compose 部署架构图.png>)

### 2.1 前置条件

需要准备：

- Docker Desktop
- Docker Compose
- DeepSeek 或 Qwen API Key
- 本地 Embedding 模型目录：`models/bge-small-zh-v1.5`

### 2.2 配置 `.env`

复制环境变量示例：

```powershell
copy .env.example .env
```

在 `.env` 中填写：

```text
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 API Key
QWEN_API_KEY=
RAG_EMBEDDING_MODEL_PATH=/app/models/bge-small-zh-v1.5
```

注意：

- 不要提交 `.env`。
- 不要把 API Key 写进 GitHub、Issue、PR、README 或任何 docs。

### 2.3 模型目录

宿主机需要存在：

```text
models/bge-small-zh-v1.5
```

Docker Compose 会挂载：

```text
./models -> /app/models
```

模型文件不复制进镜像，也不提交到 GitHub。

### 2.4 启动和访问

前台启动：

```powershell
docker compose up --build
```

后台启动：

```powershell
docker compose up -d --build
```

停止：

```powershell
docker compose down
```

访问地址：

```text
前端：http://127.0.0.1
后端 health：http://127.0.0.1/api/health
Swagger：http://127.0.0.1/api/docs
```

Docker Compose 本机部署已通过验收：

- 前端页面能打开。
- 后端 health 正常。
- Swagger 正常。
- 上传文件正常。
- 重建索引正常。
- 智能问答正常。
- sources 正常展示。
- 删除文档正常。
- Nginx `/api` 代理正常。

详细记录见：`docs/acceptance/2026-06-20-docker-compose-local.md`。

## 3. 系统总体架构

图：系统从浏览器访问开始，经 Nginx 进入前端与后端，后端负责文档处理、向量检索、LLM 问答、日志和统计。

![系统总体架构图](<photo/图 1：系统总体架构图.png>)

技术栈：

| 层级 | 技术 |
|---|---|
| 前端 | React + Vite + Ant Design |
| 后端 | FastAPI |
| RAG 编排 | LangChain / 本地 RAG 模块 |
| 向量数据库 | FAISS |
| Embedding | bge-small-zh-v1.5 |
| 大模型接口 | DeepSeek API / Qwen API |
| 数据库 | SQLite，本阶段 Docker 部署仍使用 SQLite |
| 部署 | Docker Compose + Nginx |

核心链路：

```text
React 前端
  -> Nginx /api
  -> FastAPI
  -> 文档解析
  -> Chunk[]
  -> bge-small-zh-v1.5 Embedding
  -> FAISS Top-K 检索
  -> RetrievedChunk[]
  -> DeepSeek/Qwen
  -> ChatAnswer
  -> 前端展示 answer + sources
```

## 4. RAG 问答流程

图：RAG 分为知识库构建和用户问答两条链路。系统先把课程资料向量化写入 FAISS，再根据用户问题召回相关片段并生成答案。

![RAG 检索问答流程图](<photo/图 2：RAG 检索问答流程图.png>)

RAG 流程说明：

```text
上传课程资料 PDF / DOCX / TXT
  -> 文档解析
  -> 文本清洗与切片 Chunk[]
  -> bge-small-zh-v1.5 Embedding
  -> FAISS 向量索引

用户问题
  -> 问题向量化
  -> FAISS Top-K 检索
  -> RetrievedChunk[]
  -> sources
  -> Prompt 组装
  -> DeepSeek / Qwen
  -> ChatAnswer
  -> 前端展示 answer 和 sources
```

`sources` 用于证明答案可追溯，核心字段包括：

```text
filename
page
chunk_index
score
preview
```

当没有可靠来源时，系统应拒答，避免大模型凭空编造。

## 5. 核心功能

| 功能 | 说明 |
|---|---|
| 文档上传 | 上传 PDF / DOCX / TXT 课程资料。 |
| 文档解析 | 后端解析文档文本，生成可切分内容。 |
| 文本切片 | 将文档切分为符合契约的 `Chunk[]`。 |
| 向量化 | 使用 `bge-small-zh-v1.5` 生成 embedding。 |
| FAISS 检索 | 基于问题向量进行 Top-K 检索。 |
| RAG 问答 | 将 `RetrievedChunk[]` 作为上下文，调用 DeepSeek/Qwen 生成答案。 |
| sources 溯源 | 前端展示 filename、page、chunk_index、score、preview。 |
| 问答日志 | 保存问题、答案、来源数量、模型和时间。 |
| 数据统计 | 展示文档数、chunk 数、问题数和最新提问时间。 |
| 文档删除 | 删除文档后同步清理 chunks、上传文件、processed JSON，并重建 FAISS。 |
| Docker 部署 | 使用 Docker Compose + Nginx 在本机启动。 |

## 6. 本地开发启动

后端：

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

前端：

```powershell
cd D:\Agent_project\CodeX\temporary_job\cloud_data\big_project\cloud-bigdata-rag-assistant\frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

访问地址：

```text
前端：http://127.0.0.1:5173
后端：http://127.0.0.1:8000/health
Swagger：http://127.0.0.1:8000/docs
```

本地开发前端 `.env` 示例：

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 7. 操作演示流程

这部分可作为 GitHub 页面演示和答辩讲稿：

1. 展示成员分工图，说明 A/B/C/D/E 的模块边界。
2. 展示 Docker Compose 部署图，说明本机一键部署方式。
3. 展示系统总体架构图，说明前端、后端、数据库、RAG 和文件存储的关系。
4. 展示 RAG 问答流程图，说明 Chunk、Embedding、FAISS、Top-K、LLM 和 sources 的关系。
5. 打开前端页面。
6. 上传课程资料。
7. 进入知识库页面并重建索引。
8. 提问课程相关问题。
9. 展示 answer 和 sources，说明答案来源可追溯。
10. 展示日志和统计页面。
11. 删除文档，并说明删除后会清理 chunks 和重建 FAISS，避免旧 source 残留。
12. 展示 RAG 评估报告和验收记录。

## 8. RAG 评估与证据

评估材料来自已有 Word 报告整理，没有重新编造评估数据。

相关文档：

- `docs/report/rag_evaluation_report.md`
- `docs/evaluation/rag_eval_results.md`
- `docs/report/demo_screenshot_checklist.md`
- `docs/acceptance/2026-06-20-final-dev-smoke.md`
- `docs/acceptance/2026-06-20-docker-compose-local.md`

评估说明：

- sources 可以追溯到上传资料。
- 已记录成功案例和失败/限制案例。
- 失败案例用于说明当前检索和解析能力边界，不作为虚假通过数据处理。

## 9. 已知限制

- 当前 Docker Compose 部署仍使用 SQLite。
- PostgreSQL 是后续扩展，不是当前版本目标。
- 当前没有部署到云服务器。
- 当前 PDF 解析不包含 OCR。
- 扫描版 PDF、图片版 PDF、无文本层 PDF 可能返回 `DOCUMENT_PROCESSING_FAILED`。
- `models/` 不提交，需要本地准备。
- API Key 不提交，需要本地配置。

## 10. 目录说明

```text
backend/       FastAPI 后端
frontend/      React 前端
rag/           RAG、Embedding、FAISS、LLM 调用
docs/          文档、验收、报告
photo/         GitHub 演示用架构说明图片
nginx/         Nginx 反向代理配置
data/          SQLite 数据目录
uploads/       上传文件目录
vector_store/  FAISS 索引目录
models/        本地 embedding 模型目录，不提交
```

## 11. 不要提交的运行产物

```text
.env
frontend/.env
data/*.db
uploads/
vector_store/faiss_index/
models/
frontend/node_modules/
frontend/dist/
data/raw/cloud_course_test_files/test_course.*
```

## 12. 关键文档索引

- API 契约：`docs/module_contracts.md`
- API 设计：`docs/api_design.md`
- 本地启动：`docs/local_startup.md`
- Docker 部署：`docs/deployment_guide.md`
- 前端约束：`docs/frontend_guidelines.md`
- RAG 设计：`docs/rag_design.md`
- 向量库测试：`docs/vector_db_test.md`
- 数据处理说明：`docs/data_processing.md`
- 最终验收：`docs/acceptance/`
