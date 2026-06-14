# EduRAG Pro Apple-inspired UI Upgrade

本版本基于 React + Vite + Ant Design 原项目完成页面视觉升级，保持现有路由、API 封装、mock 契约与业务逻辑不变，主要改造 UI/UX 表现。

## 已完成

- 全局采用 Apple / macOS / visionOS 启发式浅色玻璃拟态视觉系统。
- 重写 `src/assets/styles.css`，统一背景、毛玻璃卡片、圆角、阴影、按钮、输入框、表格与响应式样式。
- 左侧导航改为浮动半透明玻璃面板，选中态使用渐变指示条与柔和高亮。
- 顶部 Header 改为透明悬浮工具栏，包含全局搜索、Mock API、设置、通知、用户入口。
- 上传中心强化大面积拖拽区、发光虚线边框、文件类型徽章与处理链路预览。
- 知识库页面保留契约字段，表格改为无垂直线、低对比横线、柔和状态徽章。
- 智能问答页面强化输入区、Answer Studio、来源卡片与 no-source 稳定态。
- 问答日志页面由普通表格升级为精致时间线卡片列表，突出 question / answer / source_count / model / created_at。
- 数据概览页保持 Stats 契约字段展示，强化 B2B 指标卡片、质量门禁与轻量趋势区域。

## 验证

已执行：

```bash
npm run build
```

构建通过，生产文件已输出到 `dist/`。

## 使用

```bash
npm install
npm run dev
```

如需接入真实后端，按原项目约定配置：

```bash
VITE_USE_MOCK=false
```
