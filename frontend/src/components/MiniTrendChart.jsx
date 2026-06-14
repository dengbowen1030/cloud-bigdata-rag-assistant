import { Spin } from "antd";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { init, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef, useState } from "react";

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export default function MiniTrendChart({ stats }) {
  const chartRef = useRef(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!chartRef.current || !stats) return undefined;

    setChartLoading(true);
    const chart = init(chartRef.current);
    chart.setOption({
      color: ["#007aff"],
      tooltip: { trigger: "axis", backgroundColor: "rgba(255,255,255,0.92)", borderColor: "rgba(148,163,184,0.18)", textStyle: { color: "#1d1d1f" } },
      grid: { left: 24, right: 16, top: 26, bottom: 22, containLabel: true },
      xAxis: {
        type: "category",
        data: ["文档总量", "切片总量", "提问总量"],
        axisLabel: { interval: 0, fontSize: 11, color: "#86868b" },
      },
      yAxis: { type: "value", axisLabel: { color: "#86868b" }, splitLine: { lineStyle: { type: "dashed", color: "rgba(29,29,31,0.08)" } } },
      series: [
        {
          type: "bar",
          barWidth: 34,
          data: [stats.document_count, stats.chunk_count, stats.question_count],
          itemStyle: {
            borderRadius: [12, 12, 0, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#5ac8fa" },
                { offset: 0.56, color: "#0a84ff" },
                { offset: 1, color: "#007aff" },
              ],
            },
          },
        },
      ],
    });
    chart.resize();
    setChartLoading(false);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [stats]);

  return (
    <Spin spinning={chartLoading} tip="正在加载图表模块">
      <div ref={chartRef} className="mini-trend-chart" />
    </Spin>
  );
}
