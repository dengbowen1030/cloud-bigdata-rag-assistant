# Contribution Rules

This document defines the minimum collaboration rules for all EduRAG pull requests and issues. These rules are mandatory during Stage 1.

## Required Reading

Before starting work, every owner must read:

```text
docs/module_contracts.md
docs/stage1_execution_order.md
docs/handoff_protocol.md
```

Each owner must also read their own evidence document:

| Owner | Required evidence doc |
| --- | --- |
| A | `docs/backend_api_guidelines.md`, `docs/deployment_guide.md` |
| B | `docs/data_processing.md` |
| C | `docs/vector_db_test.md` |
| D | `docs/rag_design.md` |
| E | `docs/test_report.md` |

## PR Requirements

Every PR must include:

```text
Owner:
Completed work:
Changed files:
Contract changed: yes/no
Docs updated: yes/no
Test evidence:
Handoff target:
Current blockers:
```

Rules:

- Code changes must update the corresponding docs, or the PR must state: `This change does not affect docs`.
- Interface, field, API response, error code, or cross-module data changes must update both `docs/module_contracts.md` and `docs/api_design.md`.
- PRs without test evidence must not be moved to `Need Review`.
- A task is not complete if its output cannot be used by the next owner in `docs/handoff_protocol.md`.
- Unrelated files should not be changed in the same PR.

## Issue Completion Reply

When a member finishes an issue, they must reply in that issue with:

```text
完成内容：
交付文件：
输出数据示例：
测试证据：
需要通知谁：
当前问题：
```

If the task uses mock data, the reply must state:

```text
Mock data used:
What real upstream output is still needed:
```

## Docs Update Rules

Each owner must update their evidence doc before asking for review:

| Owner | Must update |
| --- | --- |
| A | `docs/api_design.md`, `docs/backend_api_guidelines.md`, or `docs/deployment_guide.md` as needed |
| B | `docs/data_processing.md` |
| C | `docs/vector_db_test.md` |
| D | `docs/rag_design.md` |
| E | `docs/test_report.md` |

Update `docs/module_contracts.md` and `docs/api_design.md` when changing:

```text
object fields
API request fields
API response shape
error codes
module handoff data
```

## Review Gate

A should reject or send back a PR if any of these are true:

- It changes contract fields without updating contract docs.
- It has no test evidence.
- It has no handoff statement.
- Its output cannot be consumed by the next owner.
- It adds unrelated code or files.
- It uses field names that conflict with `docs/module_contracts.md`.

## Project Board Rules

Use the GitHub Project board as follows:

```text
Todo -> task not started
In Progress -> owner is actively working
Need Review -> PR/evidence submitted and ready for A review
Done -> accepted by A
Blocked -> cannot continue without another owner or external dependency
```

Only move an issue to `Need Review` after adding the required completion reply and test evidence.

