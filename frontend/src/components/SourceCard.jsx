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
              <Text strong>当前知识库没有足够依据回答该问题</Text>
              <Text type="secondary">来源为空时页面保持稳定，并明确提示无可靠依据。</Text>
            </Space>
          }
        />
      </Card>
    );
  }

  const percent = Math.round((source.score || 0) * 100);

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
                <Tag>页码：{source.page ?? "无"}</Tag>
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
          <Descriptions.Item label="页码">{source.page ?? "无"}</Descriptions.Item>
          <Descriptions.Item label="相关度">{source.score}</Descriptions.Item>
        </Descriptions>

        <Paragraph className="source-preview">{source.preview}</Paragraph>
      </Space>
    </Card>
  );
}
