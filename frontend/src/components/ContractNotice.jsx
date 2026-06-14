import { Alert, Space, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Text } = Typography;

export default function ContractNotice({ children }) {
  return (
    <Alert
      className="contract-notice"
      type="info"
      showIcon
      icon={<IconFont type={APP_ICONS.shield} />}
      message={
        <Space size={8} wrap>
          <Text strong>契约驱动展示</Text>
          <Text type="secondary">结构安全模拟数据 · 可平滑切换真实接口</Text>
        </Space>
      }
      description={children || "当前页面字段严格来自模块契约文档，未新增临时后端字段。"}
    />
  );
}
