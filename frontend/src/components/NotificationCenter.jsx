import { Badge, Button, Divider, Popover, Tag, Tooltip, Typography } from "antd";
import { useMemo, useState } from "react";
import IconFont, { APP_ICONS } from "./IconFont";

const { Paragraph, Text, Title } = Typography;

const notificationItems = [
  {
    key: "api-ready",
    type: "系统活动",
    title: "真实 API 模式已就绪",
    desc: "当前前端保持 VITE_USE_MOCK=false，页面将通过 FastAPI 后端获取数据。",
    time: "刚刚",
    icon: APP_ICONS.api,
    tone: "success",
  },
  {
    key: "upload-flow",
    type: "流程提醒",
    title: "上传后需要重建索引",
    desc: "上传文件只会生成 Document 记录，请到知识库总览点击“重建索引”后再进行问答。",
    time: "今日",
    icon: APP_ICONS.refresh,
    tone: "warning",
  },
  {
    key: "ui-update",
    type: "界面更新",
    title: "演示模式已精简",
    desc: "页面顶部说明、接口标签和导航提示可在系统设置中开关，便于课程验收展示。",
    time: "最近更新",
    icon: APP_ICONS.notification,
    tone: "info",
  },
];

const toneLabelMap = {
  success: "正常",
  warning: "提醒",
  info: "更新",
};

function NotificationPanel({ onClose }) {
  const unreadCount = useMemo(() => notificationItems.length, []);

  return (
    <div className="notification-panel">
      <div className="notification-panel__header">
        <div>
          <Text className="notification-panel__eyebrow">Notification Center</Text>
          <Title level={4}>通知中心</Title>
        </div>
        <Tag className="notification-panel__count">{unreadCount} 条</Tag>
      </div>

      <Paragraph className="notification-panel__summary">
        展示系统活动、流程提醒和前端更新，帮助演示时快速理解当前系统状态。
      </Paragraph>

      <Divider />

      <div className="notification-list">
        {notificationItems.map((item) => (
          <div className={`notification-item notification-item--${item.tone}`} key={item.key}>
            <div className="notification-item__icon">
              <IconFont type={item.icon} />
            </div>
            <div className="notification-item__content">
              <div className="notification-item__meta">
                <Tag>{item.type}</Tag>
                <Text type="secondary">{item.time}</Text>
              </div>
              <Text strong className="notification-item__title">{item.title}</Text>
              <Paragraph>{item.desc}</Paragraph>
            </div>
            <span className="notification-item__status">{toneLabelMap[item.tone]}</span>
          </div>
        ))}
      </div>

      <Divider />

      <div className="notification-panel__footer">
        <Text type="secondary">仅展示前端演示状态，不修改后端数据契约。</Text>
        <Button size="small" type="primary" onClick={onClose}>知道了</Button>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      overlayClassName="notification-popover"
      content={<NotificationPanel onClose={() => setOpen(false)} />}
    >
      <Tooltip title="通知中心">
        <Badge dot offset={[-4, 6]}>
          <Button
            className="header-icon-button notification-trigger"
            icon={<IconFont type={APP_ICONS.notification} />}
            aria-label="打开通知中心"
          />
        </Badge>
      </Tooltip>
    </Popover>
  );
}
