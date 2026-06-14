import { Card, Col, Row, Skeleton, Space, Timeline, Typography } from "antd";
import { useEffect, useState } from "react";
import { getStats } from "../api/stats";
import IconFont, { APP_ICONS } from "../components/IconFont";
import MiniTrendChart from "../components/MiniTrendChart";
import PageHeader from "../components/PageHeader";
import QualityGatePanel from "../components/QualityGatePanel";
import StatsCard from "../components/StatsCard";

const { Paragraph, Text } = Typography;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const response = await getStats();
      setLoading(false);
      if (!response.success) {
        setErrorText(response.message || "获取统计数据失败");
        return;
      }
      setStats(response.data);
    }

    loadStats();
  }, []);

  return (
    <Space direction="vertical" size={18} className="page-stack dashboard-page">
      <PageHeader
        icon={APP_ICONS.dashboard}
        eyebrow="统计接口"
        title="数据概览 / 系统统计"
        description="以统计契约字段为唯一数据来源，构建具有商业产品首页气质的数据总览、质量门禁与联调计划。"
        tags={["统计数据", "高级看板", "图表模块", "质量门禁"]}
      />

      {errorText ? <Paragraph type="danger">{errorText}</Paragraph> : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard loading={loading} label="文档总量" value={stats?.document_count} icon={APP_ICONS.documents} hint="知识库规模" percent={Math.min(100, (stats?.document_count || 0) * 10)} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard loading={loading} label="切片总量" value={stats?.chunk_count} icon={APP_ICONS.sourceCount} hint="切片总量" percent={Math.min(100, Math.round((stats?.chunk_count || 0) / 4))} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard loading={loading} label="提问总量" value={stats?.question_count} icon={APP_ICONS.questions} hint="累计问答" percent={Math.min(100, (stats?.question_count || 0) * 2)} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard loading={loading} label="最近提问时间" value={stats?.latest_question_time} icon={APP_ICONS.calendar} hint="最近提问时间" />
        </Col>
      </Row>

      <QualityGatePanel />

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card title="契约指标趋势" className="glass-card" variant="borderless">
            {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : <MiniTrendChart stats={stats} />}
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="集成联调路线" className="glass-card" variant="borderless">
            <Timeline
              items={[
                {
                  dot: <IconFont type={APP_ICONS.check} />,
                  children: (
                    <Space direction="vertical" size={2}>
                      <Text strong>前端骨架与质量防线已完成</Text>
                      <Text type="secondary">5 个页面、统一路由、统一接口封装、运行时契约校验、错误边界</Text>
                    </Space>
                  ),
                },
                {
                  dot: <IconFont type={APP_ICONS.api} />,
                  children: (
                    <Space direction="vertical" size={2}>
                      <Text strong>等待 A 接入真实接口</Text>
                      <Text type="secondary">关闭模拟模式后按契约联调</Text>
                    </Space>
                  ),
                },
                {
                  dot: <IconFont type={APP_ICONS.shield} />,
                  children: (
                    <Space direction="vertical" size={2}>
                      <Text strong>保持接口契约不变</Text>
                      <Text type="secondary">若字段变更，必须同步模块契约与接口设计文档</Text>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
