import { Badge } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const statusMeta = {
  uploaded: { color: "processing", label: "已上传", icon: APP_ICONS.uploaded },
  processing: { color: "processing", label: "处理中", icon: APP_ICONS.processing },
  processed: { color: "success", label: "已处理", icon: APP_ICONS.processed },
  failed: { color: "error", label: "处理失败", icon: APP_ICONS.failed },
};

export default function StatusTag({ status, mode = "tag" }) {
  const meta = statusMeta[status] || { color: "default", label: status || "未知状态", icon: APP_ICONS.info };
  if (mode === "badge") {
    return <Badge status={meta.color} text={<span className={`premium-status-tag premium-status-tag--${status || "unknown"}`}><IconFont type={meta.icon} />{meta.label}</span>} />;
  }
  return <span className={`premium-status-tag premium-status-tag--${status || "unknown"}`}><IconFont type={meta.icon} />{meta.label}</span>;
}
