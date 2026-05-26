import { TenantStats } from '../components/settings/TeamStats';
import { ApiAuthentication } from '../components/settings/ApiApplication';
import { TenantDetailsForm } from '../components/settings/TenantDetailsForm';
import { SecretsVault } from '../components/settings/SecretsVault';
import { TeamAccess } from '../components/settings/TeamAccess';

export const TenantDashboard = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Organization Settings</h1>
        <p className="text-gray-400 mt-2">Manage your API keys, view usage, and configure tenant details.</p>
      </div>

      <TenantStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiAuthentication />
        <TenantDetailsForm />
      </div>

      <SecretsVault />
      
      <TeamAccess />
    </div>
  );
};