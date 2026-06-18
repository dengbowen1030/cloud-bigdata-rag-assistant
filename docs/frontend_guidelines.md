# 前端改写约束

本文档给前端组员使用。后续可以改 UI，但不能破坏真实 API 调用和数据契约。

## 当前前端运行模式

当前前端技术栈：

```text
React + Vite + Ant Design
```

真实联调模式：

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

当 `VITE_USE_MOCK=false` 时，前端必须调用 FastAPI 后端，不能改成只读 mock 数据。

## 可以改的内容

前端组员可以改：

- 页面布局。
- 颜色。
- 卡片样式。
- 表格展示方式。
- 上传页面交互提示。
- 知识库页面的信息密度。
- 智能问答页面的输入区和答案区。
- 日志和统计页面的可读性。
- 图标、间距、按钮位置、响应式布局。
- 空状态、加载态、错误提示的视觉样式。

这些改动属于 UI 表现层，不需要改后端契约。

## 不能改的内容

前端组员不能私自改：

- API 路径。
- API 请求字段。
- API 响应 envelope 结构。
- `Document` 字段名。
- `ChatAnswer` 字段名。
- `RetrievedChunk` 字段名。
- `QaLog` 字段名。
- `Stats` 字段名。
- `VITE_API_BASE_URL` 的使用方式。
- `VITE_USE_MOCK=false` 时必须走真实后端的规则。
- 上传文件类型限制：只允许 PDF、DOCX、TXT。

统一响应 envelope 必须保持：

```json
{
  "success": true,
  "data": {},
  "message": "",
  "error_code": null
}
```

失败响应必须保持：

```json
{
  "success": false,
  "data": null,
  "message": "错误说明",
  "error_code": "ERROR_CODE"
}
```

## 必须保留的页面流程

### 上传页面

必须保留：

- 只能上传 PDF、DOCX、TXT。
- 上传后展示后端返回的 `Document` 信息。
- 不能让用户误以为“已上传”就是“已处理”。

### 知识库页面

必须保留：

- 展示文档 `status`。
- 展示文档 `chunk_count`。
- 能触发 `rebuildDocument(document_id)`。
- rebuild 成功后刷新文档列表。

### 智能问答页面

必须保留：

- 调用 `POST /chat/query`。
- 请求体字段为：

```json
{
  "question": "云计算的五个基本特征是什么？",
  "top_k": 5
}
```

- 展示 `answer`。
- 展示 `model`。
- 展示 `created_at`。
- 展示 `sources`。
- sources 至少展示：
  - `filename`
  - `page`
  - `chunk_index`
  - `score`
  - `preview`

如果 `page` 为 `null`，页面应显示 `-` 或“无页码”，不能报错。

### 日志页面

必须保留：

- 调用 `GET /logs`。
- 展示 `question`、`answer`、`source_count`、`model`、`created_at`。
- 空数据时正常显示。

### 统计页面

必须保留：

- 调用 `GET /stats`。
- 展示 `document_count`、`chunk_count`、`question_count`、`latest_question_time`。
- `latest_question_time=null` 时不能报错。

## 后端失败时的前端处理

如果后端返回：

```json
{
  "success": false,
  "data": null,
  "message": "错误说明",
  "error_code": "VECTOR_INDEX_NOT_READY"
}
```

前端必须展示 `message` 或对应的友好提示，不能只显示 `Network Error`。

常见错误提示：

| error_code | 前端建议提示 |
| --- | --- |
| `VECTOR_INDEX_NOT_READY` | 请先上传文档并重建索引。 |
| `QA_CHAIN_FAILED` | 本地 embedding 模型不可用，请检查模型目录或 RAG_EMBEDDING_MODEL_PATH。 |
| `LLM_PROVIDER_UNAVAILABLE` | 大模型服务暂不可用，请检查 LLM_PROVIDER 和 API Key。 |
| `UPLOAD_FILE_TYPE_UNSUPPORTED` | 当前只支持 PDF、DOCX、TXT。 |

## 当前前端 API 封装

前端 API 封装位于：

```text
frontend/src/api/
```

当前必须保持一致的接口：

| 文件 | 函数 | 后端接口 |
| --- | --- | --- |
| `documents.js` | `uploadDocument(file)` | `POST /upload` |
| `documents.js` | `getDocuments()` | `GET /documents` |
| `documents.js` | `deleteDocument(document_id)` | `DELETE /documents/{document_id}` |
| `documents.js` | `rebuildDocument(document_id)` | `POST /documents/{document_id}/rebuild` |
| `chat.js` | `queryChat({ question, top_k })` | `POST /chat/query` |
| `logs.js` | `getLogs()` | `GET /logs` |
| `stats.js` | `getStats()` | `GET /stats` |

如果 UI 改写需要新增视觉字段，只能在前端内部转换，不能要求后端新增临时字段。

## 改 UI 前的检查清单

提交 PR 前检查：

- `VITE_USE_MOCK=false` 时是否仍然走真实后端。
- 上传页是否仍只允许 PDF、DOCX、TXT。
- 知识库页是否还能点击“重建索引”。
- Chat 页是否还能展示 answer 和 sources。
- Logs 页是否还能展示问答日志。
- Stats 页是否还能展示统计数据。
- 后端 `success=false` 时是否显示可读错误。
- 是否没有修改 API 路径、字段名和 envelope。

## 契约变更规则

如果确实需要改 API 字段或路径，不能只改前端。必须先同步更新：

```text
docs/module_contracts.md
docs/api_design.md
```

并在 PR 中说明：

```text
Contract changed: yes
Changed contract:
Affected owners:
Docs updated:
Migration or compatibility note:
```
