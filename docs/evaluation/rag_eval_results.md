# RAG Retrieval Evaluation Results

## Summary

- 总问题数：10
- 通过数量：10
- 失败数量：0
- 通过率：100.00%
- Top-K 设置：5
- Embedding 模型：bge-small-zh-v1.5 (`D:\桌面\c\cloud-bigdata-rag-assistant\models\bge-small-zh-v1.5`)
- Embedding 模式：real
- 向量维度：512
- 向量数据库：FAISS IndexFlatIP
- Chunk 数量：9
- 检索结果格式：RetrievedChunk[]

## Technical Notes

- Top-K 表示每个问题从 FAISS 中召回的最相关 chunk 数量。
- score 是归一化后的相似度分数，范围为 0 到 1，越高表示 query 与 chunk 越相似。
- source 包含 filename、page、chunk_index，能把命中的 chunk 追溯到原始知识库文件，因此可以证明答案依据来自知识库而不是普通聊天。
- 本评估只验证检索召回，不调用 LLM，不读取或提交任何 API Key。

## Result Table

| 编号 | 问题 | Top-K | 期望文件 | 实际命中文件 | 是否命中关键词 | 是否通过 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 云计算的五个基本特征是什么？ | 5 | `cloud_course_notes.txt` | `cloud_course_notes.txt`, `cloud_course_handbook.docx` | yes | yes |
| 2 | 对象存储适合保存什么类型的数据？ | 5 | `cloud_course_notes.txt` | `cloud_course_notes.txt`, `cloud_course_handbook.docx` | yes | yes |
| 3 | MapReduce 的两个主要阶段是什么？ | 5 | `cloud_course_notes.txt` | `cloud_course_notes.txt`, `cloud_course_handbook.docx`, `cloud_course_slides.pdf` | yes | yes |
| 4 | HDFS 中 NameNode 和 DataNode 分别负责什么？ | 5 | `cloud_course_handbook.docx` | `cloud_course_handbook.docx`, `cloud_course_notes.txt`, `cloud_course_slides.pdf` | yes | yes |
| 5 | Spark 的核心抽象是什么？ | 5 | `cloud_course_handbook.docx` | `cloud_course_handbook.docx`, `cloud_course_notes.txt`, `cloud_course_slides.pdf` | yes | yes |
| 6 | Docker 镜像、容器和 Docker Compose 的作用是什么？ | 5 | `cloud_course_handbook.docx` | `cloud_course_handbook.docx`, `cloud_course_slides.pdf`, `cloud_course_notes.txt` | yes | yes |
| 7 | Kubernetes 的最小调度单元是什么？ | 5 | `cloud_course_slides.pdf` | `cloud_course_slides.pdf`, `cloud_course_handbook.docx`, `cloud_course_notes.txt` | yes | yes |
| 8 | Deployment 和 Service 在 Kubernetes 中有什么作用？ | 5 | `cloud_course_slides.pdf` | `cloud_course_slides.pdf`, `cloud_course_handbook.docx`, `cloud_course_notes.txt` | yes | yes |
| 9 | 负载均衡为什么能提升系统可用性？ | 5 | `cloud_course_slides.pdf` | `cloud_course_slides.pdf`, `cloud_course_notes.txt`, `cloud_course_handbook.docx` | yes | yes |
| 10 | RAG 检索流程如何证明答案来自知识库？ | 5 | `cloud_course_slides.pdf` | `cloud_course_slides.pdf`, `cloud_course_handbook.docx`, `cloud_course_notes.txt` | yes | yes |

## Top-K Details

### 1. 云计算的五个基本特征是什么？

```json
{
  "question": "云计算的五个基本特征是什么？",
  "top_k": 5,
  "expected_file": "cloud_course_notes.txt",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 2,
      "score": 0.922905,
      "preview": "云计算的五个基本特征包括按需自助服务、广泛网络访问、资源池化、快速弹性和可计量服务。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 1,
      "score": 0.795629,
      "preview": "云计算课程测试材料 TXT"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 1,
      "score": 0.765854,
      "preview": "云计算与大数据测试材料 DOCX"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.755398,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.739829,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    }
  ]
}
```

### 2. 对象存储适合保存什么类型的数据？

```json
{
  "question": "对象存储适合保存什么类型的数据？",
  "top_k": 5,
  "expected_file": "cloud_course_notes.txt",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 3,
      "score": 0.901001,
      "preview": "对象存储适合保存海量非结构化数据，例如图片、日志、备份文件和课程资料。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.799963,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.77692,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.761177,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 2,
      "score": 0.732315,
      "preview": "云计算的五个基本特征包括按需自助服务、广泛网络访问、资源池化、快速弹性和可计量服务。"
    }
  ]
}
```

### 3. MapReduce 的两个主要阶段是什么？

```json
{
  "question": "MapReduce 的两个主要阶段是什么？",
  "top_k": 5,
  "expected_file": "cloud_course_notes.txt",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.853561,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.776678,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.766044,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.747075,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 2,
      "score": 0.718729,
      "preview": "云计算的五个基本特征包括按需自助服务、广泛网络访问、资源池化、快速弹性和可计量服务。"
    }
  ]
}
```

### 4. HDFS 中 NameNode 和 DataNode 分别负责什么？

```json
{
  "question": "HDFS 中 NameNode 和 DataNode 分别负责什么？",
  "top_k": 5,
  "expected_file": "cloud_course_handbook.docx",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.900417,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.77509,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    },
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.759185,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.749327,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 4,
      "score": 0.747367,
      "preview": "Docker 镜像用于打包应用及依赖，容器提供隔离运行环境，Docker Compose 可以编排多个服务。"
    }
  ]
}
```

### 5. Spark 的核心抽象是什么？

```json
{
  "question": "Spark 的核心抽象是什么？",
  "top_k": 5,
  "expected_file": "cloud_course_handbook.docx",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.93097,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.758723,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 4,
      "score": 0.755806,
      "preview": "Docker 镜像用于打包应用及依赖，容器提供隔离运行环境，Docker Compose 可以编排多个服务。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.748657,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    },
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.748563,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    }
  ]
}
```

### 6. Docker 镜像、容器和 Docker Compose 的作用是什么？

```json
{
  "question": "Docker 镜像、容器和 Docker Compose 的作用是什么？",
  "top_k": 5,
  "expected_file": "cloud_course_handbook.docx",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 4,
      "score": 0.931402,
      "preview": "Docker 镜像用于打包应用及依赖，容器提供隔离运行环境，Docker Compose 可以编排多个服务。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.780061,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.75615,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.737293,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 3,
      "score": 0.726757,
      "preview": "对象存储适合保存海量非结构化数据，例如图片、日志、备份文件和课程资料。"
    }
  ]
}
```

### 7. Kubernetes 的最小调度单元是什么？

```json
{
  "question": "Kubernetes 的最小调度单元是什么？",
  "top_k": 5,
  "expected_file": "cloud_course_slides.pdf",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.831074,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.708942,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.691067,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.685274,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 4,
      "score": 0.646827,
      "preview": "Docker 镜像用于打包应用及依赖，容器提供隔离运行环境，Docker Compose 可以编排多个服务。"
    }
  ]
}
```

### 8. Deployment 和 Service 在 Kubernetes 中有什么作用？

```json
{
  "question": "Deployment 和 Service 在 Kubernetes 中有什么作用？",
  "top_k": 5,
  "expected_file": "cloud_course_slides.pdf",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.830052,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 4,
      "score": 0.770073,
      "preview": "Docker 镜像用于打包应用及依赖，容器提供隔离运行环境，Docker Compose 可以编排多个服务。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 2,
      "score": 0.750256,
      "preview": "云计算的五个基本特征包括按需自助服务、广泛网络访问、资源池化、快速弹性和可计量服务。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.749238,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.730047,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    }
  ]
}
```

### 9. 负载均衡为什么能提升系统可用性？

```json
{
  "question": "负载均衡为什么能提升系统可用性？",
  "top_k": 5,
  "expected_file": "cloud_course_slides.pdf",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.794616,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 3,
      "score": 0.721237,
      "preview": "对象存储适合保存海量非结构化数据，例如图片、日志、备份文件和课程资料。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.707227,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 4,
      "score": 0.704716,
      "preview": "Docker 镜像用于打包应用及依赖，容器提供隔离运行环境，Docker Compose 可以编排多个服务。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.702577,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    }
  ]
}
```

### 10. RAG 检索流程如何证明答案来自知识库？

```json
{
  "question": "RAG 检索流程如何证明答案来自知识库？",
  "top_k": 5,
  "expected_file": "cloud_course_slides.pdf",
  "keyword_hit": true,
  "file_hit": true,
  "passed": true,
  "retrieved": [
    {
      "filename": "cloud_course_slides.pdf",
      "page": 1,
      "chunk_index": 1,
      "score": 0.777483,
      "preview": "Kubernetes 使用 Pod 作为最小调度单元，Deployment 管理副本滚动更新，Service 提供稳定访问入口。负载均衡可以把用户请求分发到多个后端实例，提升可用性。RAG 检索流程会先召回相关 chunk，再把 sourc"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 2,
      "score": 0.75415,
      "preview": "HDFS 采用主从架构，NameNode 管理元数据，DataNode 存储实际数据块。"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 1,
      "score": 0.736305,
      "preview": "云计算课程测试材料 TXT"
    },
    {
      "filename": "cloud_course_notes.txt",
      "page": null,
      "chunk_index": 4,
      "score": 0.73324,
      "preview": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段，适合处理大规模离线数据。"
    },
    {
      "filename": "cloud_course_handbook.docx",
      "page": null,
      "chunk_index": 3,
      "score": 0.714942,
      "preview": "Spark 的核心抽象是 RDD，支持内存计算，适合迭代式机器学习和交互式分析。"
    }
  ]
}
```
