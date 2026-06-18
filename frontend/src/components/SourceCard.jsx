import { Card, Descriptions, Empty, Progress, Space, Tag, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Paragraph, Text } = Typography;

export default function SourceCard({ source }) {
  if (!source) {
    return (
      <Card className="source-card source-card--empty" variant="borderless">
        <Empty
          image={<IconFont type={APP_ICONS.empty} className="empty-source-icon" />}
          description={
            <Space direction="vertical" size={4}>
              <Text strong>当前没有可展示的来源</Text>
              <Text type="secondary">请先上传文档并重建索引，或检查该问题是否能被知识库命中。</Text>
            </Space>
          }
        />
      </Card>
    );
  }

  const percent = Math.round((source.score || 0) * 100);
  const pageLabel = source.page ?? "-";

  return (
    <Card className="source-card" size="small" variant="borderless">
      <Space direction="vertical" size={12} className="full-width">
        <div className="source-card__header">
          <Space size={10}>
            <span className="source-card__icon">
              <IconFont type={APP_ICONS.source} />
            </span>
            <div>
              <Text strong>{source.filename}</Text>
              <div>
                <Tag>页码：{pageLabel}</Tag>
                <Tag>切片：{source.chunk_index}</Tag>
              </div>
            </div>
          </Space>
          <div className="source-card__score">
            <Text type="secondary">相关度</Text>
            <Progress percent={percent} size="small" status={percent >= 70 ? "success" : "normal"} />
          </div>
        </div>

        <Descriptions size="small" column={{ xs: 1, md: 3 }} className="compact-descriptions">
          <Descriptions.Item label="文件名">{source.filename}</Descriptions.Item>
          <Descriptions.Item label="页码">{pageLabel}</Descriptions.Item>
          <Descriptions.Item label="相关度">{source.score}</Descriptions.Item>
        </Descriptions>

        <Paragraph className="source-preview">{source.preview}</Paragraph>
      </Space>
    </Card>
  );
}
