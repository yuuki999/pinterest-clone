import { toast } from "@/app/hooks/shadcn/use-toast"
interface ToastMessageProps {
  title: string;
  description: string;
}

export const ToastMessage = {
  success: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: "bg-green-500 text-white border-green-500",
      title,
      description,
    });
  },

  error: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "destructive",
      title,
      description,
    });
  },

  warning: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: "bg-yellow-500 text-white border-yellow-500",
      title,
      description,
    });
  },

  info: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: "bg-blue-500 text-white border-blue-500",
      title,
      description,
    });
  },

  loading: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: "bg-gray-500 text-white border-gray-500",
      title,
      description,
    });
  }
};
