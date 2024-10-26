import { useForm } from 'react-hook-form'
import { Form, FormControl, FormLabel, FormMessage, FormField, FormItem } from '../shadcn/ui/form'
import { Input } from '../shadcn/ui/input'
import { Button } from '../shadcn/ui/button'
import BirthdaySelector from '../ui/BirthdaySelector'

interface SignupFormProps {
  onSubmit: (data: { email: string; password: string; birthdate: string }) => Promise<void>
  onSwitchMode: () => void
}

const signupSchema = {
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
  birthdate: {
    required: '生年月日を入力してください',
  },
}

export const SignupForm = ({ onSubmit, onSwitchMode }: SignupFormProps) => {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      birthdate: '',
    },
  })

  const handleSubmit = async (data: { email: string; password: string; birthdate: string }) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          rules={signupSchema.email}
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
          rules={signupSchema.password}
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="パスワードを作成"
                  {...field}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="birthdate"
          rules={signupSchema.birthdate}
          render={({ field }) => (
            <BirthdaySelector field={field} />
          )}
        />

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
          続行
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            既にアカウントをお持ちの方はログイン
          </button>
        </div>
      </form>
    </Form>
  )
}
