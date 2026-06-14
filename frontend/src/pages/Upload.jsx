import { App, Button, Card, Descriptions, Divider, Progress, Space, Steps, Tag, Typography, Upload as AntUpload } from "antd";
import { useMemo, useRef, useState } from "react";
import { uploadDocument } from "../api/documents";
import FileTypeTag from "../components/FileTypeTag";
import IconFont, { APP_ICONS } from "../components/IconFont";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";

const { Dragger } = AntUpload;
const { Paragraph, Text } = Typography;

const allowedTypes = ["pdf", "docx", "txt", "md"];

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
      message.error("当前阶段仅支持 PDF、DOCX、TXT、Markdown");
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
      message.success("模拟上传成功，已返回文档对象");
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
        description="面向 6 月 14 日集成验收的文档入口。当前阶段使用契约驱动的模拟数据，后续可直接切换 A 负责的真实上传接口。"
        tags={["文档对象", "表单上传", "模拟上传"]}
      />


      <div className="upload-grid">
        <Card className="glass-card upload-card" variant="borderless">
          <Space direction="vertical" size={16} className="full-width">
            <Dragger
              maxCount={1}
              accept=".pdf,.docx,.txt,.md,.markdown"
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
              <p className="ant-upload-hint">支持 PDF、DOCX、TXT、Markdown。前端只通过上传接口契约交互。</p>
            </Dragger>

            <div className="allowed-type-row">
              <Text type="secondary">文件类型提示</Text>
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
          <Space direction="vertical" size={12} className="full-width" style={{ marginBottom: 18 }}>
            <div className="premium-quick-card">
              <span className="premium-quick-card__icon"><IconFont type={APP_ICONS.shield} /></span>
              <div><Text strong>契约优先</Text><br /><Text type="secondary">仅展示文档对象字段，后端切换不破坏页面。</Text></div>
            </div>
            <div className="premium-quick-card">
              <span className="premium-quick-card__icon"><IconFont type={APP_ICONS.uploadLoading} /></span>
              <div><Text strong>状态可视化</Text><br /><Text type="secondary">已上传、处理中、已处理、处理失败全链路可展示。</Text></div>
            </div>
          </Space>
          <Steps
            direction="vertical"
            current={documentResult ? 1 : selectedFile ? 0 : -1}
            items={[
              { title: "已上传", description: "前端返回文档状态：已上传" },
              { title: "处理中", description: "B 负责解析、清洗、切片" },
              { title: "已处理", description: "C 建立向量索引，D 可进行问答" },
              { title: "处理失败", description: "异常时使用失败状态兜底" },
            ]}
          />
        </Card>
      </div>

      <Card title="上传状态区域 · 文档对象" className="glass-card" variant="borderless">
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
            <Paragraph type="secondary">尚未上传文件。上传后会展示后端上传接口应返回的文档对象。</Paragraph>
          </div>
        )}
        <Divider />
        <Paragraph type="secondary" className="no-margin">
          本页只做前端界面与模拟请求验证，不负责后端接口实现、文档解析、向量索引或大模型。
        </Paragraph>
      </Card>
    </Space>
  );
}
