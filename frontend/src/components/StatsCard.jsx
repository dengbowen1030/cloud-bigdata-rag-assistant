import { Card, Progress, Space, Statistic, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Text } = Typography;

export default function StatsCard({ label, value, icon = APP_ICONS.dashboard, hint, percent, loading = false }) {
  return (
    <Card className="metric-card" variant="borderless" loading={loading}>
      <div className="metric-card__top">
        <span className="metric-card__icon">
          <IconFont type={icon} />
        </span>
        <Text className="metric-card__label">{label}</Text>
      </div>
      <Statistic value={value ?? "null"} />
      {typeof percent === "number" ? <Progress percent={percent} showInfo={false} size="small" className="metric-card__progress" /> : null}
      {hint ? (
        <Space size={6} className="metric-card__hint">
          <IconFont type={APP_ICONS.check} />
          <Text type="secondary">{hint}</Text>
        </Space>
      ) : null}
    </Card>
  );
}
