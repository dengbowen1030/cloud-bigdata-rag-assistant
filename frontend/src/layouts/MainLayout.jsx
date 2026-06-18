import { Breadcrumb, Button, Input, Layout, Menu, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ApiModeBadge from "../components/ApiModeBadge";
import IconFont, { APP_ICONS } from "../components/IconFont";
import SystemSettings from "../components/SystemSettings";

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

const menuItems = [
  { key: "/upload", icon: <IconFont type={APP_ICONS.uploadCenter} />, label: <Link to="/upload">上传中心</Link> },
  { key: "/knowledge-base", icon: <IconFont type={APP_ICONS.knowledge} />, label: <Link to="/knowledge-base">知识库总览</Link> },
  { key: "/chat", icon: <IconFont type={APP_ICONS.aiChat} />, label: <Link to="/chat">智能问答</Link> },
  { key: "/logs", icon: <IconFont type={APP_ICONS.logs} />, label: <Link to="/logs">问答日志</Link> },
  { key: "/dashboard", icon: <IconFont type={APP_ICONS.dashboard} />, label: <Link to="/dashboard">数据概览</Link> },
];

const routeMetaMap = {
  "/upload": { title: "上传中心", breadcrumb: "上传中心", desc: "课程资料进入知识库的第一入口" },
  "/knowledge-base": { title: "知识库总览", breadcrumb: "知识库总览", desc: "文档资产、状态与切片质量可视化" },
  "/chat": { title: "智能问答工作台", breadcrumb: "智能问答", desc: "面向课程资料的智能问答体验" },
  "/logs": { title: "问答日志", breadcrumb: "问答日志", desc: "可追踪、可审计、可验收的问答记录" },
  "/dashboard": { title: "数据概览", breadcrumb: "数据概览", desc: "系统运行指标与前端质量门禁" },
};

export default function MainLayout({ children }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = menuItems.some((item) => item.key === location.pathname) ? location.pathname : "/upload";
  const routeMeta = routeMetaMap[selectedKey] || routeMetaMap["/upload"];

  return (
    <Layout className="app-shell">
      <Sider breakpoint="lg" collapsedWidth="0" className="app-sider" width={272}>
        <div className="brand-block">
          <div className="brand-logo">
            <IconFont type={APP_ICONS.brand} />
          </div>
          <div>
            <Title level={4}>EduRAG Pro</Title>
            <Text>课程知识库智能助教</Text>
          </div>
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} className="app-menu" />
        <div className="sider-footer-card">
          <Space direction="vertical" size={10} className="full-width">
            <span className="sider-status-pill"><IconFont type={APP_ICONS.shield} /> 契约安全已开启</span>
            <span className="sider-status-pill"><IconFont type={APP_ICONS.user} /> E 前端负责人</span>
            <Text type="secondary">高端前端视觉已启用</Text>
          </Space>
        </div>
      </Sider>
      <Layout>
        <Header className="app-header">
          <div>
            <Title level={3}>{routeMeta.title}</Title>
            <Breadcrumb
              className="app-breadcrumb"
              items={[{ title: "云计算大数据知识库" }, { title: routeMeta.breadcrumb }]}
            />
          </div>

          <Input
            allowClear
            className="header-center-search"
            placeholder="搜索页面、文档、问题..."
            prefix={<IconFont type={APP_ICONS.search} />}
            suffix={<span className="search-shortcut-hint">⌘K</span>}
          />

          <Space wrap className="header-actions">
            <ApiModeBadge />
            <Tooltip title="通知中心">
              <Button className="header-icon-button" icon={<IconFont type={APP_ICONS.notification} />} />
            </Tooltip>
            <Tooltip title="系统设置">
              <Button className="header-icon-button" onClick={() => setSettingsOpen(true)} icon={<IconFont type={APP_ICONS.settings} />} />
            </Tooltip>
            <Button type="primary" onClick={() => navigate("/dashboard")} icon={<IconFont type={APP_ICONS.dashboard} />}>
              质量看板
            </Button>
          </Space>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
      <SystemSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Layout>
  );
}
