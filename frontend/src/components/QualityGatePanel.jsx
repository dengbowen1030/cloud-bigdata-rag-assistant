import { Card, Col, Progress, Row, Space, Tag, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Text } = Typography;

const gates = [
  { label: "契约字段", value: 100, hint: "文档对象 / 问答结果 / 问答日志 / 统计数据" },
  { label: "错误隔离", value: 100, hint: "页面级错误边界保护" },
  { label: "懒加载", value: 100, hint: "路由与图表模块按需加载" },
  { label: "移动端", value: 92, hint: "320px 以上响应式检查" },
];

export default function QualityGatePanel() {
  return (
    <Card title="博士级质量门禁" className="glass-card quality-gate-card" variant="borderless">
      <Row gutter={[14, 14]}>
        {gates.map((gate) => (
          <Col xs={24} sm={12} xl={6} key={gate.label}>
            <div className="quality-gate-item">
              <div className="quality-gate-item__header">
                <Space size={8}>
                  <IconFont type={APP_ICONS.check} />
                  <Text strong>{gate.label}</Text>
                </Space>
                <Tag color={gate.value >= 95 ? "green" : "blue"}>{gate.value}%</Tag>
              </div>
              <Progress percent={gate.value} showInfo={false} size="small" />
              <Text type="secondary">{gate.hint}</Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
