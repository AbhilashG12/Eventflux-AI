import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../core/api/client';
import { socketClient } from '../../../core/websocket/socket.client'

export const useAnalytics = (tenantId: string) => {
  const [metrics, setMetrics] = useState({
    totalRuns: 0,
    successRate: 0,
    failedRuns: 0,
    avgDuration: 0,
    activeWorkflows: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/analytics');
      setMetrics(data.metrics);
      setChartData(data.chartData);
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const handlePulse = (payload: any) => {
      setMetrics(prev => {
        const newTotal = prev.totalRuns + 1;
        const newSuccess = payload.status === 'COMPLETED' ? (prev.totalRuns * (prev.successRate / 100)) + 1 : (prev.totalRuns * (prev.successRate / 100));
        
        return {
          ...prev,
          totalRuns: newTotal,
          failedRuns: payload.status === 'FAILED' ? prev.failedRuns + 1 : prev.failedRuns,
          successRate: Number(((newSuccess / newTotal) * 100).toFixed(1))
        };
      });

    
      setChartData(prev => {
        const timeKey = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newData = [...prev, { 
          time: timeKey, 
          success: payload.status === 'COMPLETED' ? 1 : 0, 
          failed: payload.status === 'FAILED' ? 1 : 0 
        }];
        return newData.slice(-20);
      });
    };

    socketClient.subscribe('analytics-pulse', handlePulse);

    return () => {
      socketClient.unsubscribe('analytics-pulse');
    };
  }, [fetchAnalytics]);

  return { metrics, chartData };
};