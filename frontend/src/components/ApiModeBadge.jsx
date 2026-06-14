import { Badge, Space, Tooltip, Typography } from "antd";
import { API_BASE_URL, USE_MOCK } from "../api/client";
import IconFont, { APP_ICONS } from "./IconFont";

const { Text } = Typography;

export default function ApiModeBadge() {
  const label = USE_MOCK ? "模拟接口" : "真实接口";
  const tooltip = USE_MOCK
    ? "当前使用契约驱动的模拟数据。设置 VITE_USE_MOCK=false 可切换真实接口。"
    : `当前请求真实后端：${API_BASE_URL || "同源接口"}`;

  return (
    <Tooltip title={tooltip}>
      <span className="status-pill status-pill--api-mode">
        <Badge status={USE_MOCK ? "processing" : "success"} />
        <Space size={6}>
          <IconFont type={APP_ICONS.api} />
          <Text>{label}</Text>
        </Space>
      </span>
    </Tooltip>
  );
}
