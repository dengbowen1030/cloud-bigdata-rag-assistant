# RAG Retrieval Evaluation Cases

This file records the test question set required by issue #15.

## Scope

- Evaluation target: RAG retrieval recall, not LLM answer generation.
- Data source: `data/raw/cloud_course_test_files/`
- File types covered: TXT, DOCX, PDF
- Embedding model: local `models/bge-small-zh-v1.5`
- Vector database: FAISS
- Result format: `RetrievedChunk[]`

## Cases

```json
[
  {
    "question": "云计算的五个基本特征是什么？",
    "expected_keywords": ["按需自助服务", "广泛网络访问", "资源池化", "快速弹性", "可计量服务"],
    "expected_file": "cloud_course_notes.txt",
    "expected_chunk_hint": "云计算的五个基本特征",
    "top_k": 5
  },
  {
    "question": "对象存储适合保存什么类型的数据？",
    "expected_keywords": ["对象存储", "非结构化数据", "图片", "日志", "备份文件"],
    "expected_file": "cloud_course_notes.txt",
    "expected_chunk_hint": "对象存储适合保存海量非结构化数据",
    "top_k": 5
  },
  {
    "question": "MapReduce 的两个主要阶段是什么？",
    "expected_keywords": ["Map", "Reduce", "大规模离线数据"],
    "expected_file": "cloud_course_notes.txt",
    "expected_chunk_hint": "MapReduce 将计算分为 Map 阶段和 Reduce 阶段",
    "top_k": 5
  },
  {
    "question": "HDFS 中 NameNode 和 DataNode 分别负责什么？",
    "expected_keywords": ["HDFS", "NameNode", "元数据", "DataNode", "数据块"],
    "expected_file": "cloud_course_handbook.docx",
    "expected_chunk_hint": "NameNode 管理元数据，DataNode 存储实际数据块",
    "top_k": 5
  },
  {
    "question": "Spark 的核心抽象是什么？",
    "expected_keywords": ["Spark", "RDD", "内存计算", "机器学习"],
    "expected_file": "cloud_course_handbook.docx",
    "expected_chunk_hint": "Spark 的核心抽象是 RDD",
    "top_k": 5
  },
  {
    "question": "Docker 镜像、容器和 Docker Compose 的作用是什么？",
    "expected_keywords": ["Docker", "镜像", "容器", "Docker Compose", "编排"],
    "expected_file": "cloud_course_handbook.docx",
    "expected_chunk_hint": "Docker Compose 可以编排多个服务",
    "top_k": 5
  },
  {
    "question": "Kubernetes 的最小调度单元是什么？",
    "expected_keywords": ["Kubernetes", "Pod", "最小调度单元"],
    "expected_file": "cloud_course_slides.pdf",
    "expected_chunk_hint": "Pod 作为最小调度单元",
    "top_k": 5
  },
  {
    "question": "Deployment 和 Service 在 Kubernetes 中有什么作用？",
    "expected_keywords": ["Deployment", "副本", "滚动更新", "Service", "稳定访问入口"],
    "expected_file": "cloud_course_slides.pdf",
    "expected_chunk_hint": "Deployment 管理副本滚动更新，Service 提供稳定访问入口",
    "top_k": 5
  },
  {
    "question": "负载均衡为什么能提升系统可用性？",
    "expected_keywords": ["负载均衡", "分发", "后端实例", "可用性"],
    "expected_file": "cloud_course_slides.pdf",
    "expected_chunk_hint": "请求分发到多个后端实例",
    "top_k": 5
  },
  {
    "question": "RAG 检索流程如何证明答案来自知识库？",
    "expected_keywords": ["RAG", "召回", "chunk", "source", "回答生成"],
    "expected_file": "cloud_course_slides.pdf",
    "expected_chunk_hint": "召回相关 chunk，再把 source 提供给回答生成",
    "top_k": 5
  }
]
```
