import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../../core/api/client';
import { socketClient } from '../../../core/websocket/socket.client';

export const useAnalytics = (tenantId: string) => {
  const [metrics, setMetrics] = useState({
    totalRuns: 0,
    successRate: 0,
    failedRuns: 0,
    avgDuration: 0,
    activeWorkflows: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  const pendingMetricsRef = useRef(metrics);
  const pendingChartRef = useRef<any[]>([]);
  const rafRef = useRef<number | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!tenantId) return; 
    
    try {
      const { data } = await apiClient.get(`/analytics/${tenantId}`);
      setMetrics(data.metrics);
      setChartData(data.chartData);
      pendingMetricsRef.current = data.metrics;
      pendingChartRef.current = data.chartData;
    } catch (err) {
      console.error(err);
    }
  }, [tenantId]); // Add tenantId as a dependency

  useEffect(() => {
    fetchAnalytics();

    const handlePulse = (payload: any) => {
      const prev = pendingMetricsRef.current;
      const newTotal = prev.totalRuns + 1;
      const newSuccess = payload.status === 'COMPLETED' 
        ? (prev.totalRuns * (prev.successRate / 100)) + 1 
        : (prev.totalRuns * (prev.successRate / 100));

      pendingMetricsRef.current = {
        ...prev,
        totalRuns: newTotal,
        failedRuns: payload.status === 'FAILED' ? prev.failedRuns + 1 : prev.failedRuns,
        successRate: Number(((newSuccess / newTotal) * 100).toFixed(1))
      };

      const timeKey = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentChartData = pendingChartRef.current;
      const lastPoint = currentChartData[currentChartData.length - 1];

      if (lastPoint && lastPoint.time === timeKey) {
        lastPoint.success += payload.status === 'COMPLETED' ? 1 : 0;
        lastPoint.failed += payload.status === 'FAILED' ? 1 : 0;
      } else {
        pendingChartRef.current = [...currentChartData, {
          time: timeKey,
          success: payload.status === 'COMPLETED' ? 1 : 0,
          failed: payload.status === 'FAILED' ? 1 : 0
        }].slice(-20);
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setMetrics({ ...pendingMetricsRef.current });
          setChartData([...pendingChartRef.current]);
          
          // Reset to null instead of undefined
          rafRef.current = null; 
        });
      }
    };

    socketClient.subscribe('analytics-pulse', handlePulse);

    return () => {
      socketClient.unsubscribe('analytics-pulse');
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [fetchAnalytics]);

  return { metrics, chartData };
};