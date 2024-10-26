import { useForm } from 'react-hook-form'
import { Form, FormControl, FormLabel, FormMessage, FormField, FormItem } from '../shadcn/ui/form'
import { Input } from '../shadcn/ui/input'
import { Button } from '../shadcn/ui/button'

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>
  onSwitchMode: () => void
}

const loginSchema = {
  email: {
    required: 'メールアドレスを入力してください',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: '有効なメールアドレスを入力してください',
    },
  },
  password: {
    required: 'パスワードを入力してください',
    minLength: {
      value: 8,
      message: 'パスワードは8文字以上である必要があります',
    },
  },
}

export const LoginForm = ({ onSubmit, onSwitchMode }: LoginFormProps) => {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          rules={loginSchema.email}
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="メール"
                  {...field}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          rules={loginSchema.password}
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="パスワード"
                  {...field}
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
          ログイン
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            または新規登録
          </button>
        </div>
      </form>
    </Form>
  )
}
