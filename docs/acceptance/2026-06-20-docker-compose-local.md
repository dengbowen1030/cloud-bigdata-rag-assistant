# 2026-06-20 Stage 3 Docker Compose 本机部署验收

## 验收结论

Docker Compose 本机部署已通过。

本阶段验证目标：

- 使用 `docker compose up --build` 在本机启动项目。
- 通过 nginx 统一暴露前端和后端 API。
- 前端访问 `http://127.0.0.1`。
- 后端健康检查访问 `http://127.0.0.1/api/health`。
- Swagger 访问 `http://127.0.0.1/api/docs`。
- 当前阶段继续使用 SQLite，不接 PostgreSQL，不上云。

## Docker 版本

```text
Docker version 29.5.3, build d1c06ef
```

## Docker Compose 版本

```text
Docker Compose version v5.1.4
```

## 构建与启动

已通过：

```powershell
docker compose up --build
```

说明：本次验收由项目负责人在本机手动完成，服务已成功启动并完成页面与接口验证。

## 访问地址

| 项目 | 地址 | 验收结果 |
|---|---|---|
| 前端页面 | `http://127.0.0.1` | 通过 |
| 后端健康检查 | `http://127.0.0.1/api/health` | 通过 |
| Swagger | `http://127.0.0.1/api/docs` | 通过 |

## 已验证功能

| 功能项 | 结果 |
|---|---|
| 前端页面能打开 | 通过 |
| 后端 health 正常 | 通过 |
| Swagger 正常 | 通过 |
| 上传文件正常 | 通过 |
| 重建索引正常 | 通过 |
| 智能问答正常 | 通过 |
| sources 正常展示 | 通过 |
| 删除文档正常 | 通过 |
| Nginx `/api` 代理正常 | 通过 |

## Nginx 代理验证

本机访问：

```text
http://127.0.0.1/api/health
```

会经由 nginx 转发到：

```text
http://backend:8000/health
```

本机访问：

```text
http://127.0.0.1/api/docs
```

会经由 nginx 转发到：

```text
http://backend:8000/docs
```

验收结果：通过。

## 已知限制

- 当前 Docker Compose 版本仍使用 SQLite。
- PostgreSQL 是下一阶段部署任务。
- 当前 PDF 解析只支持有文本层的 PDF。
- 扫描版 PDF、纯图片 PDF 或没有可提取文字的 PDF 可能返回 `DOCUMENT_PROCESSING_FAILED`。
- 测试中 `cloud_course_slides.pdf` 返回 `DOCUMENT_PROCESSING_FAILED`，原因是该 PDF 没有可提取文字。这不是部署失败，而是当前系统 PDF 解析能力的合理限制。

## 当前 blocker

无部署 blocker。
