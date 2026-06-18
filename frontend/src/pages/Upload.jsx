import { App, Button, Card, Descriptions, Divider, Progress, Space, Steps, Tag, Typography, Upload as AntUpload } from "antd";
import { useMemo, useRef, useState } from "react";
import { uploadDocument } from "../api/documents";
import FileTypeTag from "../components/FileTypeTag";
import IconFont, { APP_ICONS } from "../components/IconFont";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";

const { Dragger } = AntUpload;
const { Paragraph, Text } = Typography;

const allowedTypes = ["pdf", "docx", "txt"];

function getFileExtension(filename = "") {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "unknown";
}

function formatFileSize(size = 0) {
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default function Upload() {
  const { message } = App.useApp();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [documentResult, setDocumentResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const selectedFileType = useMemo(() => getFileExtension(selectedFile?.name), [selectedFile]);
  const isAllowed = selectedFile ? allowedTypes.includes(selectedFileType) : true;

  const handleUpload = async () => {
    if (!selectedFile) {
      message.warning("请先选择一个文件");
      return;
    }
    if (!isAllowed) {
      message.error("当前阶段仅支持 PDF、DOCX、TXT");
      return;
    }

    setUploading(true);
    setProgress(28);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setProgress(68), 180);

    try {
      const response = await uploadDocument(selectedFile);
      if (!response.success) {
        setProgress(0);
        message.error(response.message || "上传失败");
        return;
      }

      setProgress(100);
      setDocumentResult(response.data);
      message.success("上传成功，已返回 Document 对象");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setSelectedFile(null);
    setFileList([]);
    setDocumentResult(null);
    setProgress(0);
  };

  return (
    <Space direction="vertical" size={18} className="page-stack">
      <PageHeader
        icon={APP_ICONS.upload}
        eyebrow="上传接口"
        title="上传中心"
        description="上传课程资料到 FastAPI 后端。当前契约只允许 PDF、DOCX、TXT。"
        tags={["PDF", "DOCX", "TXT", "真实 API"]}
      />

      <div className="upload-grid">
        <Card className="glass-card upload-card" variant="borderless">
          <Space direction="vertical" size={16} className="full-width">
            <Dragger
              maxCount={1}
              accept=".pdf,.docx,.txt"
              fileList={fileList}
              beforeUpload={(file) => {
                setSelectedFile(file);
                setFileList([file]);
                setDocumentResult(null);
                setProgress(0);
                return false;
              }}
              onRemove={resetUpload}
              className="commercial-dragger"
            >
              <div className="upload-illustration">
                <IconFont type={APP_ICONS.upload} />
              </div>
              <p className="ant-upload-text">点击或拖拽课程资料到此区域</p>
              <p className="ant-upload-hint">支持 PDF、DOCX、TXT。前端只通过上传接口契约交互。</p>
            </Dragger>

            <div className="allowed-type-row">
              <Text type="secondary">允许的文件类型</Text>
              <Space size={8} wrap>
                {allowedTypes.map((type) => (
                  <FileTypeTag key={type} fileType={type} />
                ))}
              </Space>
            </div>

            {selectedFile ? (
              <div className="selected-file-panel">
                <Space direction="vertical" size={6}>
                  <Text strong>已选择文件</Text>
                  <Space wrap>
                    <FileTypeTag fileType={selectedFileType} filename={selectedFile.name} />
                    <Tag>{formatFileSize(selectedFile.size)}</Tag>
                    {isAllowed ? <Tag color="green">类型允许</Tag> : <Tag color="red">类型不支持</Tag>}
                  </Space>
                </Space>
              </div>
            ) : null}

            <Progress percent={progress} showInfo={progress > 0} status={progress === 100 ? "success" : "active"} />

            <Space wrap>
              <Button type="primary" size="large" loading={uploading} disabled={!selectedFile || !isAllowed} onClick={handleUpload} icon={<IconFont type={APP_ICONS.upload} />}>
                上传文件
              </Button>
              <Button size="large" onClick={resetUpload} icon={<IconFont type={APP_ICONS.refresh} />}>
                重置
              </Button>
            </Space>
          </Space>
        </Card>

        <Card className="glass-card pipeline-card" variant="borderless" title="处理链路预览">
          <Steps
            direction="vertical"
            current={documentResult ? 1 : selectedFile ? 0 : -1}
            items={[
              { title: "已上传", description: "后端返回 Document，状态通常为 uploaded。" },
              { title: "重建索引", description: "到知识库页面点击重建索引，触发解析、切片、Embedding 和 FAISS。" },
              { title: "已处理", description: "状态变为 processed，chunk_count 大于 0 后可问答。" },
              { title: "问答与来源", description: "Chat 页面展示 answer、model、created_at 和 sources。" },
            ]}
          />
        </Card>
      </div>

      <Card title="上传结果：Document" className="glass-card" variant="borderless">
        {documentResult ? (
          <Descriptions bordered column={{ xs: 1, md: 2 }} size="middle" className="contract-descriptions">
            <Descriptions.Item label="文档编号">{documentResult.document_id}</Descriptions.Item>
            <Descriptions.Item label="文件名">{documentResult.filename}</Descriptions.Item>
            <Descriptions.Item label="文件类型"><FileTypeTag fileType={documentResult.file_type} /></Descriptions.Item>
            <Descriptions.Item label="文件大小">{documentResult.file_size}</Descriptions.Item>
            <Descriptions.Item label="处理状态"><StatusTag status={documentResult.status} /></Descriptions.Item>
            <Descriptions.Item label="切片数量">{documentResult.chunk_count}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{documentResult.created_at}</Descriptions.Item>
          </Descriptions>
        ) : (
          <div className="empty-contract-panel">
            <IconFont type={APP_ICONS.file} />
            <Paragraph type="secondary">尚未上传文件。上传后这里会展示后端返回的 Document 对象。</Paragraph>
          </div>
        )}
        <Divider />
        <Paragraph type="secondary" className="no-margin">
          上传后请进入知识库页面点击“重建索引”，完成后再到 Chat 页面提问。
        </Paragraph>
      </Card>
    </Space>
  );
}
