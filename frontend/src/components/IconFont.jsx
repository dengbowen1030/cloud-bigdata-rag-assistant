const normalizeIconFile = (type = "") => {
  if (!type) return "ic_overview.svg";
  if (String(type).endsWith(".svg")) return type;
  return `${type}.svg`;
};

/**
 * Local iconfont-compatible SVG icon component.
 * 团队已提供 all_icon.zip 中的 SVG 文件，本组件统一从 public/icons/ 读取，
 * 并通过 CSS mask + currentColor 控制颜色，避免 PNG 固定颜色导致风格不统一。
 */
export default function IconFont({ type, className = "", style, title, ...props }) {
  const file = normalizeIconFile(type);
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`app-svg-icon ${className}`.trim()}
      style={{ "--icon-url": `url('/icons/${file}')`, ...style }}
      {...props}
    />
  );
}

export const APP_ICONS = {
  brand: "ic_ai_chat.svg",
  upload: "ic_upload.svg",
  uploadCenter: "ic_upload_center.svg",
  uploadLarge: "ic_drag_drop.svg",
  uploadSuccess: "ic_upload_successed.svg",
  uploadLoading: "upload_loading.svg",
  knowledge: "ic_database.svg",
  documents: "ic_documents.svg",
  chat: "Nav_Chat.svg",
  aiChat: "Nav_Chat.svg",
  logs: "ic_logs.svg",
  log: "ic_log.svg",
  dashboard: "ic_dashboard.svg",
  analytics: "ic_analytics.svg",
  overview: "ic_overview.svg",
  file: "ic_file.svg",
  pdf: "ic_file_pdf.svg",
  docx: "ic-file-doc.svg",
  txt: "ic_file_txt.svg",
  md: "file-md.svg",
  xlsx: "ic_file.svg",
  folder: "ic_folder.svg",
  source: "ic_source.svg",
  sourceCount: "Metric_Chunks.svg",
  questions: "Metric_Questions.svg",
  quote: "ic_quote.svg",
  noSource: "ic_no_source.svg",
  shield: "Status_Mock.svg",
  api: "Status_Mock.svg",
  empty: "ic_no_source.svg",
  model: "ic_model.svg",
  clock: "ic_time.svg",
  calendar: "ic_calendar.svg",
  timestamp: "ic_timestamp.svg",
  search: "ic_search.svg",
  filter: "ic-filter.svg",
  filterLogs: "ic_filter_logs.svg",
  sort: "ic_sort.svg",
  refresh: "ic_refresh.svg",
  check: "ic_success.svg",
  success: "ic_success.svg",
  warning: "ic_warning.svg",
  error: "ic_error.svg",
  failed: "ic_failed.svg",
  processed: "ic_Processed.svg",
  processing: "ic_processing.svg",
  uploaded: "ic_Uploaded.svg",
  delete: "ic_delete.svg",
  edit: "edit.svg",
  view: "ic_view_list.svg",
  copy: "ic_copy.svg",
  retry: "ic_retry.svg",
  send: "ic_send.svg",
  history: "ic_history.svg",
  trend: "ic_trend.svg",
  barChart: "ic_bar_chart.svg",
  lineChart: "ic_line_chart.svg",
  timeline: "ic_timeline.svg",
  settings: "ic-settings.svg",
  user: "ic_user.svg",
  notification: "ic-notification.svg",
  info: "ic_information.svg",
  close: "ic_close.svg",
  more: "ic_more.svg",
  back: "Back.svg",
  arrowRight: "arrow-right.svg",
};
