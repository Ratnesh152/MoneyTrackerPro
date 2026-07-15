import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    ENTRA_CLIENT_ID: z.string().min(1),
    ENTRA_TENANT_ID: z.string().min(1),
    ENTRA_CLIENT_SECRET: z.string().min(1),
    BC_API_URL: z.string().url(),
    BC_ENVIRONMENT: z.string().min(1),
    BC_COMPANY_ID: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {},
});
