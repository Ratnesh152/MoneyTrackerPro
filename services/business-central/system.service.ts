import { env } from '@/config/env';

export interface CompanyInfo {
  id: string;
  name: string;
  displayName: string;
  businessProfileId: string;
}

export interface EnvironmentInfo {
  environmentName: string;
  version: string;
}

/**
 * Returns company info from env vars — no BC API call needed.
 * BC's standard /companies endpoint requires the environment in a different
 * path format that conflicts with the custom API base URL.
 */
export async function getCompanies(): Promise<CompanyInfo[]> {
  return [
    {
      id: env.BC_COMPANY_ID,
      name: 'MoneyTracker Pro',
      displayName: 'MoneyTracker Pro',
      businessProfileId: '',
    },
  ];
}

export async function getEnvironmentInfo(): Promise<EnvironmentInfo> {
  return {
    environmentName: env.BC_ENVIRONMENT || 'Production',
    version: '28.0',
  };
}
