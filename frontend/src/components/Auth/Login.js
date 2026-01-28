import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required')
});

const Login = () => {
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
      const response = await authService.login(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Login successful!');
      navigate('/chat');
    } catch (error) {
      toast.error(error.message || 'Login failed');
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
            <p className="text-blue-100">Welcome back! Sign in to your account</p>
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
                  type="password"
                  placeholder="Password"
                  className={`input-field ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
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
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-primary-600 font-semibold hover:text-primary-700 underline"
                  onClick={() => navigate('/register')}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;