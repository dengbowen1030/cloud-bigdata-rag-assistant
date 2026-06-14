import { App, Button, Card, Col, Empty, Input, InputNumber, Row, Skeleton, Space, Tag, Timeline, Typography } from "antd";
import { useMemo, useState } from "react";
import { queryChat } from "../api/chat";
import IconFont, { APP_ICONS } from "../components/IconFont";
import PageHeader from "../components/PageHeader";
import SourceCard from "../components/SourceCard";

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

const exampleQuestions = ["软件开发周期是什么？", "知识库页面应该展示哪些字段？", "当前知识库是否包含未上传资料的详细内容？"];

export default function Chat() {
  const { message } = App.useApp();
  const [question, setQuestion] = useState("软件开发周期是什么？");
  const [topK, setTopK] = useState(5);
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sources = useMemo(() => (Array.isArray(answer?.sources) ? answer.sources : []), [answer]);
  const reliableSourceCount = sources.filter((source) => Number(source.score || 0) >= 0.7).length;

  const handleSubmit = async (incomingQuestion) => {
    if (loading) return;
    const trimmedQuestion = (incomingQuestion ?? question).trim();
    if (!trimmedQuestion) {
      message.warning("问题不能为空");
      return;
    }

    setQuestion(trimmedQuestion);
    setLoading(true);
    try {
      const response = await queryChat({ question: trimmedQuestion, top_k: topK });

      if (!response.success) {
        message.error(response.message || "问答请求失败");
        return;
      }

      setAnswer(response.data);
      setHistory((previous) => [response.data, ...previous].slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnswer = async () => {
    if (!answer?.answer) return;
    try {
      await navigator.clipboard.writeText(answer.answer);
      message.success("已复制回答内容");
    } catch {
      message.warning("当前浏览器不允许直接复制，请手动选择文本复制");
    }
  };

  return (
    <Space direction="vertical" size={18} className="page-stack chat-page">
      <PageHeader
        icon={APP_ICONS.chat}
        eyebrow="问答接口"
        title="智能问答工作台"
        description="面向 D 负责的问答结果渲染页面，以专业智能工作台体验承载提问、回答、来源、模型与无来源稳定态。"
        tags={["问答请求", "问答结果", "来源列表", "运行时契约校验"]}
      />


      <Row gutter={[18, 18]} align="stretch">
        <Col xs={24} xl={9}>
          <Card className="glass-card chat-input-card" variant="borderless" title="提问控制台">
            <Space direction="vertical" size={14} className="full-width">
              <div>
                <Text strong>问题内容</Text>
                <TextArea
                  rows={7}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="请输入课程资料相关问题"
                  className="question-input"
                  showCount
                  maxLength={500}
                />
              </div>
              <Space wrap>
                <Text>召回片段数</Text>
                <InputNumber min={1} max={10} value={topK} onChange={(value) => setTopK(value || 5)} />
                <Button type="primary" loading={loading} onClick={() => handleSubmit()} icon={<IconFont type={APP_ICONS.send} />}>
                  发送问题
                </Button>
              </Space>
              <div className="example-question-area">
                <Text type="secondary">示例问题</Text>
                <Space size={8} wrap>
                  {exampleQuestions.map((item) => (
                    <Tag.CheckableTag
                      key={item}
                      checked={question === item}
                      onChange={() => {
                        setQuestion(item);
                        handleSubmit(item);
                      }}
                    >
                      {item}
                    </Tag.CheckableTag>
                  ))}
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          <Card
            className="glass-card answer-card"
            variant="borderless"
            title="回答工作区"
            extra={
              answer ? (
                <Button size="small" onClick={handleCopyAnswer} icon={<IconFont type={APP_ICONS.copy} />}>
                  复制回答
                </Button>
              ) : null
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : answer ? (
              <Space direction="vertical" size={16} className="full-width">
                <div className="answer-header-row">
                  <div>
                    <Text type="secondary">用户问题</Text>
                    <Paragraph className="answer-question">{answer.question}</Paragraph>
                  </div>
                  <Space wrap>
                    <Tag icon={<IconFont type={APP_ICONS.model} />}>模型：{answer.model}</Tag>
                    <Tag icon={<IconFont type={APP_ICONS.clock} />}>{answer.created_at}</Tag>
                  </Space>
                </div>
                <div className="answer-body">
                  <Paragraph>{answer.answer}</Paragraph>
                </div>
                <div className="source-summary-strip">
                  <span><IconFont type={APP_ICONS.source} /> 来源数：{sources.length}</span>
                  <span><IconFont type={APP_ICONS.check} /> 高可信来源：{reliableSourceCount}</span>
                  <span><IconFont type={APP_ICONS.shield} /> 可靠来源防护</span>
                </div>
              </Space>
            ) : (
              <Empty description="请输入问题并发送，当前阶段会返回契约格式的模拟问答结果" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card title="来源卡片" className="glass-card source-section" variant="borderless">
            {sources.length ? (
              <Space direction="vertical" size={12} className="full-width">
                {sources.map((source) => (
                  <SourceCard key={`${source.filename}-${source.page}-${source.chunk_index}`} source={source} />
                ))}
              </Space>
            ) : (
              <SourceCard />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="会话记忆与快捷入口" className="glass-card" variant="borderless">
            <Space direction="vertical" size={12} className="full-width" style={{ marginBottom: 16 }}>
              <div className="premium-quick-card"><span className="premium-quick-card__icon"><IconFont type={APP_ICONS.history} /></span><div><Text strong>本地会话</Text><br /><Text type="secondary">仅保存本地最近 6 次问答。</Text></div></div>
              <div className="premium-quick-card"><span className="premium-quick-card__icon"><IconFont type={APP_ICONS.noSource} /></span><div><Text strong>无来源保护</Text><br /><Text type="secondary">来源为空时优雅展示，不崩溃。</Text></div></div>
            </Space>
            {history.length ? (
              <Timeline
                items={history.map((item) => {
                  const itemSources = Array.isArray(item.sources) ? item.sources : [];
                  return {
                    dot: <IconFont type={itemSources.length ? APP_ICONS.chat : APP_ICONS.empty} />,
                    children: (
                      <Space direction="vertical" size={2}>
                        <Text strong>{item.question}</Text>
                        <Text type="secondary">模型：{item.model} · 来源：{itemSources.length}</Text>
                        <Text type="secondary">{item.created_at}</Text>
                      </Space>
                    ),
                  };
                })}
              />
            ) : (
              <Empty description="暂无本地问答记录" />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
