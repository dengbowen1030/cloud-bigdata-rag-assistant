export const mockDocuments = [
  {
    document_id: "doc_001",
    filename: "课程导论.pdf",
    file_type: "pdf",
    file_size: 123456,
    status: "processed",
    chunk_count: 32,
    created_at: "2026-06-09T20:00:00",
  },
  {
    document_id: "doc_002",
    filename: "软件工程笔记.docx",
    file_type: "docx",
    file_size: 234567,
    status: "processing",
    chunk_count: 0,
    created_at: "2026-06-10T09:15:00",
  },
  {
    document_id: "doc_003",
    filename: "实验要求.txt",
    file_type: "txt",
    file_size: 45678,
    status: "uploaded",
    chunk_count: 0,
    created_at: "2026-06-10T10:05:00",
  },
  {
    document_id: "doc_004",
    filename: "课程大纲.xlsx",
    file_type: "xlsx",
    file_size: 98654,
    status: "failed",
    chunk_count: 0,
    created_at: "2026-06-10T10:30:00",
  },
  {
    document_id: "doc_005",
    filename: "知识增强架构概览.pdf",
    file_type: "pdf",
    file_size: 312880,
    status: "processed",
    chunk_count: 48,
    created_at: "2026-06-11T08:40:00",
  },
  {
    document_id: "doc_006",
    filename: "团队验收计划.docx",
    file_type: "docx",
    file_size: 167990,
    status: "processed",
    chunk_count: 21,
    created_at: "2026-06-11T11:20:00",
  },
];

export const mockChatAnswer = {
  question: "软件开发周期是什么？",
  answer:
    "根据课程资料，软件开发周期通常包括需求分析、系统设计、编码实现、测试验证、部署交付与维护迭代等阶段。每个阶段都需要形成可追踪的产物，以保证项目能够持续推进。",
  sources: [
    {
      filename: "课程导论.pdf",
      page: 3,
      chunk_index: 1,
      score: 0.82,
      preview: "软件开发周期一般由需求分析、设计、实现、测试、部署和维护等活动构成。",
    },
    {
      filename: "软件工程笔记.docx",
      page: 6,
      chunk_index: 4,
      score: 0.76,
      preview: "在课程项目中，每个阶段都需要明确负责人、输入输出和验收标准。",
    },
    {
      filename: "团队验收计划.docx",
      page: 2,
      chunk_index: 3,
      score: 0.69,
      preview: "第一阶段验收重点检查页面可访问、接口契约一致、测试证据完整。",
    },
  ],
  model: "deepseek",
  created_at: "2026-06-09T20:30:00",
};

export const mockNoSourceChatAnswer = {
  question: "当前知识库是否包含未上传资料的详细内容？",
  answer: "当前知识库没有足够依据回答该问题，请先上传相关课程资料后再提问。",
  sources: [],
  model: "deepseek",
  created_at: "2026-06-10T11:00:00",
};

export const mockQaLogs = [
  {
    log_id: "log_001",
    question: "软件开发周期是什么？",
    answer: "根据课程资料，软件开发周期包括需求分析、设计、编码、测试、部署和维护等阶段。",
    source_count: 2,
    model: "deepseek",
    created_at: "2026-06-09T20:30:00",
  },
  {
    log_id: "log_002",
    question: "如何进行项目验收？",
    answer: "课程资料强调验收应围绕功能完成度、测试证据、文档同步和团队交接记录展开。",
    source_count: 1,
    model: "qwen",
    created_at: "2026-06-10T09:40:00",
  },
  {
    log_id: "log_003",
    question: "当前知识库是否包含未上传资料的详细内容？",
    answer: "当前知识库没有足够依据回答该问题，请先上传相关课程资料后再提问。",
    source_count: 0,
    model: "deepseek",
    created_at: "2026-06-10T11:00:00",
  },
  {
    log_id: "log_004",
    question: "知识库页面应该展示哪些字段？",
    answer: "知识库页至少展示文件名、文件类型、处理状态、切片数量、创建时间。",
    source_count: 2,
    model: "qwen",
    created_at: "2026-06-11T09:05:00",
  },
  {
    log_id: "log_005",
    question: "来源为空时如何处理？",
    answer: "前端应展示当前知识库没有足够依据回答该问题，不应白屏或报错。",
    source_count: 0,
    model: "deepseek",
    created_at: "2026-06-11T10:18:00",
  },
];

export const mockStats = {
  document_count: 10,
  chunk_count: 320,
  question_count: 45,
  latest_question_time: "2026-06-09T21:00:00",
};
