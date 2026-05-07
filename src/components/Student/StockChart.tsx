import { useEffect, useRef } from 'react';
import { createChart, type IChartApi } from 'lightweight-charts';
import { useStockStore } from '@/store/stockStore';
import { SECTOR_COLORS, SECTOR_ICONS } from '@/data/scenarios';

interface StockChartProps {
  stockId: string;
}

export function StockChart({ stockId }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { stocks } = useStockStore();
  const stock = stocks[stockId];

  useEffect(() => {
    if (!chartContainerRef.current || !stock) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 200,
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

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    });

    const data = (stock.priceHistory || []).map((p) => ({
      time: p.round as unknown as string,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    }));

    if (data.length > 0) {
      candleSeries.setData(data);
    }

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
  }, [stock, stockId]);

  if (!stock) return null;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: SECTOR_COLORS[stock.sector] }}
        >
          {(() => { const Icon = SECTOR_ICONS[stock.sector]; return Icon ? <Icon size={14} /> : null; })()}
        </div>
        <h3 className="font-semibold">{stock.name} 차트</h3>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
