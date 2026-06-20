# 2026-06-20 dev 集成验收：知识库删除功能

## 分支

- 当前分支：`dev`
- 当前基线：`origin/dev`，`bcb4a29`

## 修复范围

- 后端 `DELETE /documents/{document_id}` 成功响应补充固定 message。
- 删除文档时同步清理：
  - `documents` 表记录
  - 对应 `chunks` 表记录
  - `uploads/raw/{document_id}/`
  - `uploads/processed/{document_id}.json`
- 删除后从 SQLite 中剩余 chunks 全量重建 FAISS。
- 如果没有剩余 chunks，清空 `vector_store/faiss_index/index.faiss` 和 `metadata.json`。
- 补充后端 smoke tests 覆盖删除行为。

## 删除接口行为

成功：

```json
{
  "success": true,
  "data": {
    "document_id": "doc_xxx",
    "deleted": true
  },
  "message": "Document deleted successfully.",
  "error_code": null
}
```

失败：

```json
{
  "success": false,
  "data": null,
  "message": "Document not found.",
  "error_code": "DOCUMENT_NOT_FOUND"
}
```

## 数据库清理结果

- 删除存在的文档后，`GET /documents` 不再返回该 `document_id`。
- 删除存在的文档后，`chunks` 表不再包含该 `document_id`。
- 删除后 `/stats` 的 `document_count` 和 `chunk_count` 会按剩余数据库记录重新统计。

## FAISS 重建策略

当前不做单条向量删除。删除文档后采用简单可靠策略：

1. 先删除旧 `index.faiss` 和 `metadata.json`。
2. 从 SQLite `chunks` 表读取剩余 chunks。
3. 如果仍有 chunks，则重新 embedding 并写入新的 FAISS index。
4. 如果没有 chunks，则保持 FAISS 文件不存在，`/chat/query` 返回 `VECTOR_INDEX_NOT_READY`。

该策略保证已删除文档不会继续作为 `ChatAnswer.sources` 返回。

## 自动测试结果

已通过：

```powershell
C:\Users\19866\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m unittest discover -s backend\tests -p "test_*.py"
```

- 结果：`Ran 16 tests in 1.379s OK`
- 说明：系统 `python.exe` 指向 Windows Store 占位程序，无法启动；本次使用 Codex bundled Python，并已安装 `backend/requirements.txt` 与 `reportlab` 后执行测试。

## 前端构建结果

已通过：

```powershell
cd frontend
npm.cmd run build
```

- 结果：Vite build 成功。
- 说明：首次在沙箱内执行时，Vite 写入 `frontend/node_modules/.vite-temp` 出现 `EPERM`；使用提升权限重跑同一命令后通过。

## 人工验收结果

本轮未进行浏览器点击式人工验收。后端删除链路已经由自动化测试覆盖，前端删除入口已通过生产构建验证。

建议人工验收流程：

1. 启动后端。
2. 启动前端。
3. 上传 TXT / DOCX / PDF。
4. 分别重建索引。
5. 提问：`云计算的五个基本特征是什么？`
6. 删除一个文档。
7. 刷新知识库，确认文档不再出现。
8. 再次提问，确认 sources 不包含被删除文档。
9. 查看 stats 和 logs。

## 当前 blocker

- 无代码 blocker。
- 环境注意事项：本机系统 `python.exe` 当前不可用，建议使用可运行的 Python 环境，或使用 Codex bundled Python 完整路径执行后端命令。
