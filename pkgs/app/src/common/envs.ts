export const API_HOSTNAME: string =
  import.meta.env.VITE_API_HOSTNAME || 'http://localhost:3000';

export const IS_PROD: boolean = import.meta.env.VITE_IS_PROD || false;

export const GITHUB_APP = IS_PROD ? 'specfy' : 'specfy-local';
