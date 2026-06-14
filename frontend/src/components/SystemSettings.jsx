import { App, Button, Divider, Modal, Segmented, Slider, Space, Switch, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import IconFont, { APP_ICONS } from "./IconFont";
import {
  applySystemSettings,
  defaultSystemSettings,
  loadSystemSettings,
  saveSystemSettings,
  themeOptions,
} from "../settings/themeConfig";

const { Paragraph, Text, Title } = Typography;

function ThemePreview({ theme }) {
  return (
    <div className="theme-preview" style={{ "--preview-bg": theme.previewBg, "--preview-gradient": theme.gradient, "--preview-panel": theme.previewPanel, "--preview-sidebar": theme.previewSidebar, "--preview-text": theme.text }}>
      <div className="theme-preview__sidebar" />
      <div className="theme-preview__main">
        <div className="theme-preview__topline">
          <span />
          <span />
        </div>
        <div className="theme-preview__split">
          <div className="theme-preview__card theme-preview__card--large">
            <i />
            <i />
            <i />
          </div>
          <div className="theme-preview__card theme-preview__card--small">
            <b />
            <b />
          </div>
        </div>
        <div className="theme-preview__dots">
          <em />
          <em />
          <em />
        </div>
      </div>
    </div>
  );
}

function ThemeTile({ theme, active, onSelect }) {
  return (
    <button
      type="button"
      className={`theme-tile ${active ? "theme-tile--active" : ""}`}
      style={{ "--tile-accent": theme.accent, "--tile-gradient": theme.gradient }}
      onClick={() => onSelect(theme.key)}
      aria-pressed={active}
    >
      <span className="theme-tile__check">
        <IconFont type={APP_ICONS.check} />
      </span>
      <ThemePreview theme={theme} />
      <span className="theme-tile__meta">
        <span className="theme-tile__title">{theme.emoji} {theme.name}</span>
        <span className="theme-tile__english">{theme.english}</span>
        <span className="theme-tile__desc">{theme.description}</span>
      </span>
    </button>
  );
}

export default function SystemSettings({ open, onClose }) {
  const { message } = App.useApp();
  const [settings, setSettings] = useState(() => loadSystemSettings());

  useEffect(() => {
    applySystemSettings(settings);
    saveSystemSettings(settings);
  }, [settings]);

  useEffect(() => {
    applySystemSettings(loadSystemSettings());
  }, []);

  const activeTheme = useMemo(
    () => themeOptions.find((item) => item.key === settings.theme) || themeOptions[0],
    [settings.theme]
  );

  const updateSetting = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSystemSettings);
    message.success("已恢复默认主题与系统设置");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={1040}
      className="system-settings-modal"
      title={null}
      destroyOnClose={false}
    >
      <div className="system-settings">
        <div className="system-settings__hero">
          <div>
            <Text className="system-settings__eyebrow">System Settings</Text>
            <Title level={2}>系统设置</Title>
            <Paragraph>
              选择 EduRAG Pro 的视觉主题、毛玻璃强度、动效与界面密度。所有设置会自动保存到本地浏览器。
            </Paragraph>
          </div>
          <div className="system-settings__active-chip" style={{ "--active-gradient": activeTheme.gradient }}>
            <span>{activeTheme.emoji}</span>
            <div>
              <Text strong>{activeTheme.name}</Text>
              <Text type="secondary">{activeTheme.english}</Text>
            </div>
          </div>
        </div>

        <Divider />

        <section className="settings-section">
          <div className="settings-section__head">
            <div>
              <Title level={4}>主题风格矩阵</Title>
              <Paragraph>点击主题卡片即可实时切换全局视觉系统。</Paragraph>
            </div>
            <Tag className="settings-premium-tag">Apple-style Theme Matrix</Tag>
          </div>

          <div className="theme-selector-matrix">
            {themeOptions.map((theme) => (
              <ThemeTile
                key={theme.key}
                theme={theme}
                active={settings.theme === theme.key}
                onSelect={(value) => updateSetting("theme", value)}
              />
            ))}
          </div>
        </section>

        <Divider />

        <section className="settings-section">
          <div className="settings-section__head">
            <div>
              <Title level={4}>界面偏好</Title>
              <Paragraph>这些设置用于调整系统偏好设置中的高级交互感。</Paragraph>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-control-card">
              <div>
                <Text strong>外观模式</Text>
                <Paragraph>可跟随系统，也可固定浅色或深色。</Paragraph>
              </div>
              <Segmented
                value={settings.appearance}
                onChange={(value) => updateSetting("appearance", value)}
                options={[
                  { label: "自动", value: "auto" },
                  { label: "浅色", value: "light" },
                  { label: "深色", value: "dark" },
                ]}
              />
            </div>

            <div className="settings-control-card">
              <div>
                <Text strong>毛玻璃强度</Text>
                <Paragraph>控制顶部栏、侧栏和卡片的高斯模糊程度。</Paragraph>
              </div>
              <Slider
                min={14}
                max={34}
                value={settings.glassBlur}
                onChange={(value) => updateSetting("glassBlur", value)}
              />
            </div>

            <div className="settings-control-card settings-control-card--inline">
              <div>
                <Text strong>优雅动效</Text>
                <Paragraph>关闭后将减少悬浮、缩放和渐进入场动画。</Paragraph>
              </div>
              <Switch
                checked={!settings.reduceMotion}
                onChange={(checked) => updateSetting("reduceMotion", !checked)}
              />
            </div>

            <div className="settings-control-card settings-control-card--inline">
              <div>
                <Text strong>紧凑布局</Text>
                <Paragraph>提高信息密度，适合小屏幕或大量表格数据。</Paragraph>
              </div>
              <Switch
                checked={settings.compactMode}
                onChange={(checked) => updateSetting("compactMode", checked)}
              />
            </div>

            <div className="settings-control-card settings-control-card--inline">
              <div>
                <Text strong>显示快捷键提示</Text>
                <Paragraph>控制顶部搜索框右侧的快捷键视觉提示。</Paragraph>
              </div>
              <Switch
                checked={settings.showShortcutHint}
                onChange={(checked) => updateSetting("showShortcutHint", checked)}
              />
            </div>

            <div className="settings-control-card">
              <div>
                <Text strong>圆角风格</Text>
                <Paragraph>从原生 macOS 到 visionOS 大圆角之间切换。</Paragraph>
              </div>
              <Segmented
                value={settings.roundedLevel}
                onChange={(value) => updateSetting("roundedLevel", value)}
                options={[
                  { label: "标准", value: "standard" },
                  { label: "柔和", value: "large" },
                  { label: "超圆", value: "vision" },
                ]}
              />
            </div>
          </div>
        </section>

        <div className="system-settings__footer">
          <Space>
            <Button onClick={resetSettings} icon={<IconFont type={APP_ICONS.refresh} />}>
              恢复默认
            </Button>
            <Button type="primary" onClick={onClose} icon={<IconFont type={APP_ICONS.check} />}>
              完成
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
}
