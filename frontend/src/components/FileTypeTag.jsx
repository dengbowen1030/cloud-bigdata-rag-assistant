import { Space, Tag, Typography } from "antd";
import IconFont, { APP_ICONS } from "./IconFont";

const { Text } = Typography;

const fileTypeIconMap = {
  pdf: APP_ICONS.pdf,
  docx: APP_ICONS.docx,
  txt: APP_ICONS.txt,
  md: APP_ICONS.md,
  markdown: APP_ICONS.md,
  xlsx: APP_ICONS.xlsx,
};

export default function FileTypeTag({ fileType, filename }) {
  const normalized = String(fileType || "unknown").toLowerCase();
  return (
    <Space size={8} className="file-type-tag">
      <span className={`file-type-icon file-type-icon--${normalized}`}>
        <IconFont type={fileTypeIconMap[normalized] || APP_ICONS.file} />
      </span>
      <Tag>{normalized === "unknown" ? "未知" : normalized}</Tag>
      {filename ? <Text className="file-type-name">{filename}</Text> : null}
    </Space>
  );
}
