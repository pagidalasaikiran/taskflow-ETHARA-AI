import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-80px)] max-w-md w-full mx-auto py-12">
      <div className="flex items-center gap-4 mb-12 lg:hidden">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <span className="text-3xl font-bold text-surface-950 tracking-tight">TaskFlow</span>
      </div>

      <div className="mb-12">
        <h2 className="text-4xl font-extrabold text-surface-950 mb-4 tracking-tight leading-tight">Welcome back</h2>
        <p className="text-surface-500 text-xl font-medium">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <div className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
            })}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
            })}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" loading={isLoading} className="w-full h-12 text-lg font-bold shadow-xl shadow-primary-500/25">
            Sign In
          </Button>
        </div>
      </form>

      <p className="mt-10 text-center text-surface-500 text-lg">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-bold transition-all hover:underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  );
}
