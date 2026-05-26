import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../core/api/client';
import { useErrorStore } from '../../../core/store/error.store';
import { useSuccessStore } from '../../../core/store/success.store';

interface Secret {
  id: string;
  name: string;
  createdAt: string;
}

export const useSecrets = () => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showError = useErrorStore(state => state.showError);
  const showSuccess = useSuccessStore(state => state.showSuccess);

  const fetchSecrets = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/secrets');
      setSecrets(data);
    } catch (error) {
      showError("Failed to load secrets");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const addSecret = async (name: string, value: string) => {
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/secrets', { name, value });
      setSecrets(prev => [...prev, data]);
      showSuccess("Secret saved securely");
      return true;
    } catch (error: any) {
      showError(error.response?.data?.error || "Failed to save secret");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSecret = async (id: string) => {
    try {
      await apiClient.delete(`/secrets/${id}`);
      setSecrets(prev => prev.filter(s => s.id !== id));
      showSuccess("Secret deleted");
    } catch (error) {
      showError("Failed to delete secret");
    }
  };

  return { secrets, isLoading, isSubmitting, addSecret, deleteSecret };
};