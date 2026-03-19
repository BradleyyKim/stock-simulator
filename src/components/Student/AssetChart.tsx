import { useEffect, useRef } from 'react';
import { createChart, type IChartApi } from 'lightweight-charts';
import { usePlayerStore } from '@/store/playerStore';

export function AssetChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { currentPlayer } = usePlayerStore();

  useEffect(() => {
    if (!chartContainerRef.current || !currentPlayer) return;

    const history = currentPlayer.assetHistory || [];
    if (history.length < 2) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 180,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#f1f5f9' },
        horzLines: { color: '#f1f5f9' },
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
      },
      timeScale: {
        borderColor: '#e2e8f0',
        visible: true,
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
      crosshairMarkerRadius: 4,
    });

    const data = history.map((s) => ({
      time: s.round as unknown as string,
      value: s.totalAssets,
    }));

    lineSeries.setData(data);

    // 시작선 (10만원) 표시
    lineSeries.createPriceLine({
      price: 100000,
      color: '#94a3b8',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: false,
    });

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [currentPlayer]);

  const history = currentPlayer?.assetHistory || [];
  if (history.length < 2) return null;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">내 자산 변화</h3>
      <div ref={chartContainerRef} />
    </div>
  );
}
