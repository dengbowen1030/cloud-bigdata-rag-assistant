# 本机 Docker Compose 部署指南

验收状态：Docker Compose 本机部署已通过。前端、后端 health、Swagger、上传、重建索引、问答、sources、删除文档和 Nginx `/api` 代理均已完成验收。

## 阶段说明

本阶段是 Stage 3 部署第一步，只做本机 Docker Compose 部署：

- 继续使用 SQLite。
- PostgreSQL 是下一阶段部署任务。
- 不上云。
- 不改变后端 API 契约。
- 不改变业务逻辑。

## Docker Desktop 前置要求

本机需要安装并启动 Docker Desktop。

检查命令：

```powershell
docker --version
docker compose version
docker info
```

如果 `docker info` 无法连接 daemon，通常说明 Docker Desktop 没有启动，或当前终端没有访问 Docker 的权限。

## 服务组成

本阶段 Docker Compose 包含 3 个服务：

| 服务 | 作用 |
|---|---|
| `backend` | 运行 FastAPI，监听容器内 `8000`。 |
| `frontend-build` | 使用 Node 构建 React/Vite 前端 dist，并写入共享 volume。 |
| `nginx` | 托管前端 dist，并把 `/api/` 代理到 `backend:8000`。 |

最终用户只访问 nginx 暴露的 80 端口。

## 环境变量配置

复制示例文件：

```powershell
copy .env.example .env
```

`.env` 只保存在本机，不提交到 GitHub。

本机 Docker Compose 阶段需要重点配置：

```text
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的本机 DeepSeek Key
QWEN_API_KEY=你的本机 Qwen Key，如不用可留空
```

不要把真实 API Key 写进：

- `docker-compose.yml`
- README
- Issue
- PR
- docs

## Embedding 模型位置

宿主机必须存在：

```text
models/bge-small-zh-v1.5
```

Compose 会把宿主机目录挂载到容器：

```text
./models:/app/models:ro
```

模型文件不会复制进镜像，也不能提交到 GitHub。

容器内后端使用：

```text
RAG_EMBEDDING_MODE=real
RAG_EMBEDDING_MODEL_PATH=/app/models/bge-small-zh-v1.5
RAG_EMBEDDING_DOWNLOAD=0
```

如果模型目录不存在，rebuild 或 chat query 会失败，这是预期行为，不允许静默 fallback 到 mock。

## SQLite 与持久化目录

本阶段继续使用 SQLite：

```text
DATABASE_URL=sqlite:////app/data/edurag.db
```

持久化目录：

| 宿主机目录 | 容器目录 | 用途 |
|---|---|---|
| `data/` | `/app/data` | SQLite 数据库文件。 |
| `uploads/` | `/app/uploads` | 上传原始文件和 processed JSON。 |
| `vector_store/` | `/app/vector_store` | FAISS index 和 metadata。 |
| `models/` | `/app/models` | 本地 bge embedding 模型，只读挂载。 |

## 启动命令

前台启动：

```powershell
cd cloud-bigdata-rag-assistant
docker compose up --build
```

后台启动：

```powershell
cd cloud-bigdata-rag-assistant
docker compose up -d --build
```

第一次构建会安装 Python 和 Node 依赖，耗时较长。

## 访问地址

启动成功后访问：

```text
http://127.0.0.1
http://127.0.0.1/api/health
http://127.0.0.1/api/docs
```

Nginx 代理规则：

```text
/      -> 前端 dist
/api/  -> backend:8000，并去掉 /api 前缀
```

因此：

```text
http://127.0.0.1/api/health -> http://backend:8000/health
http://127.0.0.1/api/docs   -> http://backend:8000/docs
```

为保证 Swagger 页面能加载接口定义，nginx 还会把 `/openapi.json` 和 `/docs/oauth2-redirect` 转发到后端。

## 停止命令

停止容器：

```powershell
docker compose down
```

如果使用前台启动，也可以在运行窗口按 `Ctrl+C` 停止。

## 验证命令

检查 Compose 配置：

```powershell
docker compose config
```

健康检查：

```powershell
curl.exe http://127.0.0.1/api/health
```

预期返回统一 envelope：

```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "message": "",
  "error_code": null
}
```

## 不要提交的文件或目录

不要提交：

```text
.env
frontend/.env
data/*.db
uploads/
vector_store/faiss_index/
models/
frontend/node_modules/
frontend/dist/
```

## 已知限制

- 当前 Docker Compose 版本仍使用 SQLite。
- PostgreSQL 是下一阶段部署任务。
- 当前阶段不配置云服务器和公网 URL。
- 本机必须提前准备 `models/bge-small-zh-v1.5`。
- 当前 PDF 解析不包含 OCR。
- 有文本层的 PDF 可以解析。
- 扫描版 PDF、纯图片 PDF 或没有可提取文字的 PDF 可能返回 `DOCUMENT_PROCESSING_FAILED`。
