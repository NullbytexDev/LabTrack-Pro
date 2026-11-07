import { getToken } from '@/api/client';

/** Public runtime settings for the interface. Never put secrets here. */
export const appParams = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  token: getToken(),
};
