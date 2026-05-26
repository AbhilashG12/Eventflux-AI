import { useState } from 'react';
import { apiClient } from '../../../core/api/client';
import { useErrorStore } from '../../../core/store/error.store';
import { useSuccessStore } from '../../../core/store/success.store';

export const useTeamInvites = () => {
  const [isInviting, setIsInviting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const showError = useErrorStore(state => state.showError);
  const showSuccess = useSuccessStore(state => state.showSuccess);

  const generateInvite = async (email: string) => {
    setIsInviting(true);
    try {
      const { data } = await apiClient.post('/invites', { email });
      setGeneratedLink(data.inviteLink);
      showSuccess(`Invite generated for ${email}`);
      return true;
    } catch (err: any) {
      showError(err.response?.data?.error || "Failed to send invite");
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  return { generateInvite, generatedLink, isInviting };
};