export const API_HOSTNAME =
  import.meta.env.VITE_API_HOSTNAME || 'http://localhost:3000';

export const IS_PROD = import.meta.env.VITE_IS_PROD || false;

export const GITHUB_APP = IS_PROD ? 'specfy' : 'specfy-local';
