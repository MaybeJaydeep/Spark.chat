import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Email must be valid'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  displayName: yup.string()
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName || data.username
      });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Header */}
          <div className="gradient-bg text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Spark.chat</h1>
            <p className="text-blue-100">Create your account to get started</p>
          </div>
          
          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  className={`input-field ${errors.username ? 'input-error' : ''}`}
                  {...register('username')}
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Display Name (optional)"
                  className="input-field"
                  {...register('displayName')}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className={`input-field ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-primary-600 font-semibold hover:text-primary-700 underline"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;