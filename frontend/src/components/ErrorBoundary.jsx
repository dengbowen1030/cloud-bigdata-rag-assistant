import { Component } from "react";
import { Button, Result, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Paragraph, Text } = Typography;

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "未知前端渲染错误" };
  }

  componentDidCatch(error, info) {
    console.error("[RouteErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          className="route-error-result glass-card"
          status="error"
          icon={<IconFont type={APP_ICONS.shield} />}
          title="页面渲染异常已被隔离"
          subTitle="错误边界已阻止整站白屏。请检查最近改动的页面组件或契约字段。"
          extra={
            <Button type="primary" onClick={this.handleReset} icon={<IconFont type={APP_ICONS.refresh} />}>
              重新渲染当前页面
            </Button>
          }
        >
          <Paragraph>
            <Text type="secondary">错误信息：</Text>
            <Text code>{this.state.errorMessage}</Text>
          </Paragraph>
        </Result>
      );
    }

    return this.props.children;
  }
}
