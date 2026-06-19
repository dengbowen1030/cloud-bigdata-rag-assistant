import { Button, Input, Layout, Menu, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ApiModeBadge from "../components/ApiModeBadge";
import NotificationCenter from "../components/NotificationCenter";
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

export default function MainLayout({ children }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = menuItems.some((item) => item.key === location.pathname) ? location.pathname : "/upload";
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
        <div className="sider-footer-card sider-footer-card--clean collapsible-status-panel">
          <div className="sider-footer-title">当前状态</div>
          <div className="sider-status-list">
            <span className="sider-status-pill sider-status-pill--split">
              <IconFont type={APP_ICONS.shield} />
              <span>契约安全</span>
              <strong>已开启</strong>
            </span>
            <span className="sider-status-pill sider-status-pill--split">
              <IconFont type={APP_ICONS.user} />
              <span>负责人</span>
              <strong>E 前端</strong>
            </span>
          </div>
        </div>
      </Sider>
      <Layout>
        <Header className="app-header app-header--search-only">
          <Input
            allowClear
            className="header-center-search"
            placeholder="搜索页面、文档、问题..."
            prefix={<IconFont type={APP_ICONS.search} />}
            suffix={<span className="search-shortcut-hint">⌘K</span>}
          />

          <Space wrap className="header-actions">
            <span className="collapsible-api-mode"><ApiModeBadge /></span>
            <NotificationCenter />
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
