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
    <div className="max-w-md w-full mx-auto">
      <div className="flex items-center gap-3 mb-10 lg:hidden">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-surface-900 tracking-tight">TaskFlow</span>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold text-surface-900 mb-3 tracking-tight">Welcome back</h2>
        <p className="text-surface-500 text-lg">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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

        <div className="pt-2">
          <Button type="submit" loading={isLoading} className="w-full h-12 text-base font-semibold shadow-lg shadow-primary-500/25">
            Sign In
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-surface-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
