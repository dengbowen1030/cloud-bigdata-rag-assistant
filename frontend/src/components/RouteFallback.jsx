import { Card, Skeleton, Space, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Text } = Typography;

export default function RouteFallback() {
  return (
    <Card className="glass-card route-fallback" variant="borderless">
      <Space direction="vertical" size={14} className="full-width">
        <Space>
          <span className="route-fallback__icon">
            <IconFont type={APP_ICONS.api} />
          </span>
          <Text strong>正在加载页面模块...</Text>
        </Space>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Space>
    </Card>
  );
}
