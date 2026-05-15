import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../core/api/client';
import { useSuccessStore } from '../../../core/store/success.store';
import { useErrorStore } from '../../../core/store/error.store';

export const useDLQ = () => {
  const [dlqItems, setDlqItems] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState<string | null>(null);

  const showSuccess = useSuccessStore(state => state.showSuccess);
  const showError = useErrorStore(state => state.showError);

  const fetchDLQ = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/dlq');
      setDlqItems(data);
    } catch (err) {
      console.error("Failed to load DLQ");
    }
  }, []);

  useEffect(() => {
    fetchDLQ();
    const interval = setInterval(fetchDLQ, 5000);
    return () => clearInterval(interval);
  }, [fetchDLQ]);

  const handleReplay = async (id: string) => {
    setIsReplaying(id);
    try {
      await apiClient.post(`/dlq/${id}/replay`);
      showSuccess("Event successfully queued for replay!");
      fetchDLQ();
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