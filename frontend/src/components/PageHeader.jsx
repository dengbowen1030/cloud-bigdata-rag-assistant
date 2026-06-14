import { Card, Space, Tag, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Paragraph, Text, Title } = Typography;

export default function PageHeader({ icon = APP_ICONS.brand, eyebrow, title, description, children, tags = [] }) {
  return (
    <Card className="page-hero" variant="borderless">
      <div className="page-hero__inner">
        <div className="page-hero__main">
          <div className="page-hero__icon">
            <IconFont type={icon} />
          </div>
          <div>
            {eyebrow ? <Text className="page-hero__eyebrow">{eyebrow}</Text> : null}
            <Title level={2} className="page-hero__title">
              {title}
            </Title>
            {description ? <Paragraph className="page-hero__desc">{description}</Paragraph> : null}
            {tags.length ? (
              <Space size={8} wrap className="page-hero__tags">
                {tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            ) : null}
          </div>
        </div>
        {children ? <div className="page-hero__extra">{children}</div> : null}
      </div>
    </Card>
  );
}
