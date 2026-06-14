import { Card, Col, Empty, Input, Row, Select, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getLogs } from "../api/logs";
import IconFont, { APP_ICONS } from "../components/IconFont";
import PageHeader from "../components/PageHeader";
import StatsCard from "../components/StatsCard";

const { Paragraph, Text } = Typography;

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [modelFilter, setModelFilter] = useState("all");

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const response = await getLogs();
      setLoading(false);

      if (!response.success) {
        setErrorText(response.message || "获取日志失败");
        return;
      }
      setLogs(response.data || []);
    }

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    return logs.filter((item) => {
      const matchKeyword = lowerKeyword
        ? [item.question, item.answer, item.model, item.created_at].some((value) => String(value || "").toLowerCase().includes(lowerKeyword))
        : true;
      const matchModel = modelFilter === "all" ? true : item.model === modelFilter;
      return matchKeyword && matchModel;
    });
  }, [logs, keyword, modelFilter]);

  const noSourceCount = logs.filter((item) => Number(item.source_count || 0) === 0).length;
  const sourceTotal = logs.reduce((sum, item) => sum + Number(item.source_count || 0), 0);
  const modelOptions = Array.from(new Set(logs.map((item) => item.model).filter(Boolean))).map((model) => ({ value: model, label: model }));

  return (
    <Space direction="vertical" size={18} className="page-stack">
      <PageHeader
        icon={APP_ICONS.logs}
        eyebrow="日志接口"
        title="问答审计日志中心"
        description="将问答日志从普通后台表格升级为精致时间线，突出用户问题、智能回答、来源数量与模型信息，适合答辩时展示系统可追踪性。"
        tags={["问答日志", "时间线", "来源统计", "审计追踪"]}
      />


      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard label="提问总量" value={logs.length} icon={APP_ICONS.questions} hint="日志数量" percent={Math.min(100, logs.length * 12)} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard label="来源总量" value={sourceTotal} icon={APP_ICONS.source} hint="来源数量求和" percent={Math.min(100, sourceTotal * 10)} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard label="无来源回答" value={noSourceCount} icon={APP_ICONS.empty} hint="来源数量为 0" percent={logs.length ? Math.round((noSourceCount / logs.length) * 100) : 0} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard label="模型数量" value={new Set(logs.map((item) => item.model)).size} icon={APP_ICONS.model} hint="模型名称去重" percent={50} />
        </Col>
      </Row>

      <Card className="glass-card log-list-card" variant="borderless" loading={loading}>
        {errorText ? <Paragraph type="danger">{errorText}</Paragraph> : null}
        <div className="toolbar-row">
          <Space wrap className="toolbar-row__left">
            <Input
              allowClear
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="按问题 / 回答 / 模型搜索"
              prefix={<IconFont type={APP_ICONS.search} />}
              className="table-search"
            />
            <Select
              value={modelFilter}
              onChange={setModelFilter}
              className="status-select"
              options={[{ value: "all", label: "全部模型" }, ...modelOptions]}
            />
          </Space>
          <Text type="secondary">共 {filteredLogs.length} 条</Text>
        </div>

        {filteredLogs.length ? (
          <div className="log-list">
            {filteredLogs.map((item) => {
              const sourceCount = Number(item.source_count || 0);
              return (
                <article className="log-card" key={item.log_id}>
                  <span className="log-card__icon">
                    <IconFont type={sourceCount > 0 ? APP_ICONS.timeline : APP_ICONS.noSource} />
                  </span>
                  <div className="log-card__content">
                    <Text className="log-card__question">{item.question}</Text>
                    <Paragraph className="log-card__answer" ellipsis={{ rows: 2, expandable: true, symbol: "展开" }}>
                      {item.answer}
                    </Paragraph>
                    <div className="log-card__meta">
                      <span className={sourceCount > 0 ? "log-source-pill" : "log-source-pill log-source-pill--empty"}>
                        <IconFont type={APP_ICONS.sourceCount} /> 来源：{sourceCount}
                      </span>
                      <Tag icon={<IconFont type={APP_ICONS.model} />}>模型：{item.model}</Tag>
                    </div>
                  </div>
                  <time className="log-card__time">{item.created_at}</time>
                </article>
              );
            })}
          </div>
        ) : (
          <Empty description={keyword || modelFilter !== "all" ? "没有匹配的审计日志" : "暂无问答日志数据"} />
        )}
      </Card>
    </Space>
  );
}
