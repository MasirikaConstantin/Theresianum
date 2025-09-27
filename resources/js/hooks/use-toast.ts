import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast: {
      success: (message: string, opts?: any) => toast.success(message, opts),
      error: (message: string, opts?: any) => toast.error(message, opts),
      info: (message: string, opts?: any) => toast.info(message, opts),
      warning: (message: string, opts?: any) => toast.warning(message, opts),
    }
  };
};