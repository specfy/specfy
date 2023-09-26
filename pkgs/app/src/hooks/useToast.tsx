import { useContext } from 'react';

import { ToastContext } from '@/components/Toast';

export const useToast = () => useContext(ToastContext);
