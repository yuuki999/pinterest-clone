import { toast } from "@/app/hooks/shadcn/use-toast"

interface ToastMessageProps {
  title: string;
  description: string;
}

const baseToastStyles = "px-6 py-4 rounded-lg [&>div>h2]:text-lg [&>div>div]:text-base";
// text-xl → text-lg (1.125rem) タイトル
// text-lg → text-base (1rem) 説明文

export const ToastMessage = {
  success: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: `${baseToastStyles} bg-green-500 text-white border-green-500`,
      title: title,
      description: description,
    });
  },

  error: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "destructive",
      className: baseToastStyles,
      title: title,
      description: description,
    });
  },

  warning: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: `${baseToastStyles} bg-yellow-500 text-white border-yellow-500`,
      title: title,
      description: description,
    });
  },

  info: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: `${baseToastStyles} bg-blue-500 text-white border-blue-500`,
      title: title,
      description: description,
    });
  },

  loading: ({ title, description }: ToastMessageProps) => {
    toast({
      variant: "default",
      className: `${baseToastStyles} bg-gray-500 text-white border-gray-500`,
      title: title,
      description: description,
    });
  }
};
