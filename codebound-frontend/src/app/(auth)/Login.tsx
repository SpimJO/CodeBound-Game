import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/db/queries/useAuth';
import { Code } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
    identifier: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    const { loginMutation } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: '', password: '' },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await loginMutation.mutateAsync(data);
            const token = response?.data?.token;
            if (token && import.meta.env.VITE_TOKEN_NAME) {
                Cookies.set(import.meta.env.VITE_TOKEN_NAME, token, {
                    expires: 30,
                    sameSite: 'lax',
                });
            }
            toast.success('Login successful!');
            navigate({ to: '/' });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const message = err.response?.data?.message || err.message || 'Login failed';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-500 flex items-center justify-center">
                            <Code className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-xl font-bold">CodeBound</span>
                    </div>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Sign in</CardTitle>
                        <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="identifier">Username</Label>
                                <Input
                                    id="identifier"
                                    type="text"
                                    placeholder="Enter username"
                                    className="bg-zinc-800 border-zinc-700"
                                    autoComplete="username"
                                    {...register('identifier')}
                                />
                                {errors.identifier && (
                                    <p className="text-sm text-red-400">{errors.identifier.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
                                    className="bg-zinc-800 border-zinc-700"
                                    autoComplete="current-password"
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                        <p className="mt-4 text-center text-sm text-zinc-500">
                            Don&apos;t have an account?{' '}
                            <Link to="/auth/register" className="text-cyan-400 hover:underline">
                                Register
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
