import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { ROLES } from '../../constants';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { role: ROLES.MEMBER } });

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-8 lg:hidden">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-surface-800">TaskFlow</span>
      </div>

      <h2 className="text-2xl font-bold text-surface-800 mb-1">Create account</h2>
      <p className="text-surface-500 mb-8">Join your team and start managing projects</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          icon={User}
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />

        <Input
          label="Email"
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
          placeholder="Min. 6 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
        />

        <Select
          label="Role"
          error={errors.role?.message}
          options={[
            { value: ROLES.MEMBER, label: 'Team Member' },
            { value: ROLES.ADMIN, label: 'Admin' },
          ]}
          {...register('role')}
        />

        <Button type="submit" loading={isLoading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
