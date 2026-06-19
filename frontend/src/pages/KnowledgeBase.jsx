import { App, Button, Card, Col, Collapse, Input, Popconfirm, Row, Select, Space, Table, Tooltip, Typography } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { deleteDocument, getDocuments, rebuildDocument } from "../api/documents";
import FileTypeTag from "../components/FileTypeTag";
import IconFont, { APP_ICONS } from "../components/IconFont";
import PageHeader from "../components/PageHeader";
import StatsCard from "../components/StatsCard";
import StatusTag from "../components/StatusTag";

const { Paragraph, Text } = Typography;

export default function KnowledgeBase() {
  const { message } = App.useApp();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rebuildingId, setRebuildingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [errorText, setErrorText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const autoRebuildIdsRef = useRef(new Set());

  const loadDocuments = async () => {
    setLoading(true);
    const response = await getDocuments();
    setLoading(false);

    if (!response.success) {
      setErrorText(response.message || "获取文档列表失败");
      return;
    }

    setErrorText("");
    setDocuments(response.data || []);
  };

  const handleRebuild = async (documentId, options = {}) => {
    setRebuildingId(documentId);
    const response = await rebuildDocument(documentId);
    setRebuildingId("");

    if (!response.success) {
      message.error(response.error_code ? `${response.message || "重建索引失败"} (${response.error_code})` : response.message || "重建索引失败");
      return;
    }

    message.success(options.auto ? "检测到已上传文档，已自动重建索引" : "索引重建完成");
    await loadDocuments();
  };

  const handleDelete = async (documentId) => {
    setDeletingId(documentId);
    const response = await deleteDocument(documentId);
    setDeletingId("");

    if (!response.success) {
      message.error(response.error_code ? `${response.message || "删除文档失败"} (${response.error_code})` : response.message || "删除文档失败");
      return;
    }

    message.success("文档已删除");
    await loadDocuments();
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    const target = documents.find(
      (item) =>
        item.status === "uploaded" &&
        Number(item.chunk_count || 0) === 0 &&
        !autoRebuildIdsRef.current.has(item.document_id),
    );

    if (!target) return;

    autoRebuildIdsRef.current.add(target.document_id);
    handleRebuild(target.document_id, { auto: true });
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    return documents.filter((item) => {
      const matchKeyword = lowerKeyword
        ? [item.filename, item.file_type, item.status, item.created_at].some((value) => String(value || "").toLowerCase().includes(lowerKeyword))
        : true;
      const matchStatus = statusFilter === "all" ? true : item.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [documents, keyword, statusFilter]);

  const processedCount = documents.filter((item) => item.status === "processed").length;
  const chunkTotal = documents.reduce((sum, item) => sum + Number(item.chunk_count || 0), 0);
  const failedCount = documents.filter((item) => item.status === "failed").length;
  const processingCount = documents.filter((item) => item.status === "processing").length;

  const columns = [
    {
      title: "文件名",
      dataIndex: "filename",
      key: "filename",
      render: (value, record) => <FileTypeTag fileType={record.file_type} filename={value} />,
    },
    {
      title: "文件类型",
      dataIndex: "file_type",
      key: "file_type",
      width: 130,
      render: (value) => <FileTypeTag fileType={value} />,
    },
    {
      title: "处理状态",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (value) => <StatusTag status={value} mode="badge" />,
    },
    {
      title: "切片数量",
      dataIndex: "chunk_count",
      key: "chunk_count",
      align: "right",
      width: 130,
      sorter: (a, b) => Number(a.chunk_count || 0) - Number(b.chunk_count || 0),
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 190,
      sorter: (a, b) => String(a.created_at).localeCompare(String(b.created_at)),
    },
    {
      title: "操作",
      key: "actions",
      width: 230,
      fixed: "right",
      render: (_, record) => (
        <Space size={8}>
          <Button
            size="small"
            type="primary"
            loading={rebuildingId === record.document_id}
            disabled={record.status === "processing" || deletingId === record.document_id}
            onClick={() => handleRebuild(record.document_id)}
          >
            重建索引
          </Button>
          <Popconfirm
            title="确认删除该文档？"
            description="删除后将移除该文档记录，相关文件和索引由后端统一处理。"
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true, loading: deletingId === record.document_id }}
            onConfirm={() => handleDelete(record.document_id)}
          >
            <Button
              size="small"
              danger
              loading={deletingId === record.document_id}
              disabled={rebuildingId === record.document_id || record.status === "processing"}
            >
              删除文件
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={18} className="page-stack">
      <PageHeader
        icon={APP_ICONS.knowledge}
        eyebrow="文档列表接口"
        title="知识库管理中心"
        description="查看真实 Document 记录，并触发后端 rebuild 流程生成 chunks 与 FAISS 索引。"
        tags={["真实 API", "Document", "Rebuild", "FAISS"]}
      >
        <Button onClick={loadDocuments} loading={loading} icon={<IconFont type={APP_ICONS.refresh} />}>
          刷新列表
        </Button>
      </PageHeader>

      <Collapse
        className="kb-metrics-collapse"
        bordered={false}
        defaultActiveKey={[]}
        items={[
          {
            key: "metrics",
            label: (
              <div className="kb-metrics-collapse__label">
                <span>知识库统计概览</span>
                <Text type="secondary">文档总量、已处理、切片总量与需关注状态</Text>
              </div>
            ),
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard label="文档总量" value={documents.length} icon={APP_ICONS.file} hint="documents 表记录数" percent={Math.min(100, documents.length * 10)} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard label="已处理" value={processedCount} icon={APP_ICONS.check} hint="status=processed" percent={documents.length ? Math.round((processedCount / documents.length) * 100) : 0} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard label="切片总量" value={chunkTotal} icon={APP_ICONS.knowledge} hint="chunk_count 汇总" percent={Math.min(100, Math.round(chunkTotal / 4))} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard label="需关注" value={failedCount + processingCount} icon={APP_ICONS.shield} hint="processing + failed" percent={documents.length ? Math.round(((failedCount + processingCount) / documents.length) * 100) : 0} />
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <Card className="glass-card" variant="borderless">
        {errorText ? <Paragraph type="danger">{errorText}</Paragraph> : null}
        <div className="toolbar-row">
          <Space wrap className="toolbar-row__left">
            <Input
              allowClear
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="按文件名 / 文件类型 / 状态搜索"
              prefix={<IconFont type={APP_ICONS.search} />}
              className="table-search"
            />
            <Select
              prefix={<IconFont type={APP_ICONS.filter} />}
              value={statusFilter}
              onChange={setStatusFilter}
              className="status-select"
              options={[
                { value: "all", label: "全部状态" },
                { value: "uploaded", label: "已上传" },
                { value: "processing", label: "处理中" },
                { value: "processed", label: "已处理" },
                { value: "failed", label: "处理失败" },
              ]}
            />
          </Space>
          <Tooltip title="当前过滤在前端完成，不新增后端字段">
            <Text type="secondary">共 {filteredDocuments.length} 条</Text>
          </Tooltip>
        </div>
        <Table
          rowKey="document_id"
          loading={loading}
          columns={columns}
          dataSource={filteredDocuments}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1000 }}
          className="commercial-table"
          locale={{ emptyText: keyword || statusFilter !== "all" ? "没有匹配的文档" : "暂无文档数据" }}
        />
      </Card>
    </Space>
  );
}
