import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../core/api/client';
import { useSuccessStore } from '../../../core/store/success.store';
import { useErrorStore } from '../../../core/store/error.store';

export const useDLQ = () => {
  const [dlqItems, setDlqItems] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState<string | null>(null);

  const showSuccess = useSuccessStore((state: any) => state.showSuccess);
  const showError = useErrorStore((state: any) => state.showError);

  const fetchDLQ = useCallback(async () => {
    try {

      const response = await apiClient.get('/dlq');
      
      console.log("🔍 RAW DLQ Response:", response.data);
      const parsedItems = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.items || response.data?.data || []);
        
      setDlqItems(parsedItems);
      
    } catch (err) {
      console.error("❌ Failed to load DLQ", err);
    }
  }, []);

  useEffect(() => {
    fetchDLQ();
    // 5 second polling is perfect for a real-time feel on a DLQ
    const interval = setInterval(fetchDLQ, 5000); 
    return () => clearInterval(interval);
  }, [fetchDLQ]);

  const handleReplay = async (id: string) => {
    setIsReplaying(id);
    try {
      await apiClient.post(`/dlq/${id}/replay`);
      showSuccess("Event successfully queued for replay!");
      fetchDLQ(); // Instantly refresh data instead of waiting for the interval
    } catch (err: any) {
      showError(err.response?.data?.error || "Replay failed");
    } finally {
      setIsReplaying(null);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  return {
    dlqItems,
    expandedRow,
    isReplaying,
    handleReplay,
    toggleRow
  };
};