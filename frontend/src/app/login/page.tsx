"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, Chrome, Facebook } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const uid = searchParams.get('uid');

        if (token && uid) {
            setIsLoading(true);
            // Store auth data
            localStorage.setItem("meetbarter_token", token);
            localStorage.setItem("meetbarter_uid", uid);

            // Force a hard redirect to ensure AuthContext re-initializes with the new token
            window.location.href = '/dashboard';
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            // Success toast handled in AuthContext or here if preferred
            // toast.success('Welcome back!'); // AuthContext handles it
            router.push('/dashboard');
        } catch (error) {
            toast.error('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
        // Redirect to backend OAuth endpoint which handles the handshake
        if (provider === 'Google') {
            window.location.href = `${API_BASE_URL}/auth/google`;
        } else if (provider === 'Facebook') {
            window.location.href = `${API_BASE_URL}/auth/facebook`;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Link href="/" className="flex items-center justify-center mb-8">
                    <img src="/assets/logo horizental color-03.png" alt="MeetBarter" className="h-12 w-auto" />
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to your account to continue trading
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Remember me for 30 days
                                </Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                                Or continue with
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleSocialLogin('Google')}
                                className="w-full"
                            >
                                <Chrome className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSocialLogin('Facebook')}
                                className="w-full"
                            >
                                <Facebook className="mr-2 h-4 w-4" />
                                Facebook
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <p className="text-sm text-center text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-primary hover:underline font-medium">
                                Sign up for free
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <p className="text-xs text-center text-muted-foreground mt-4">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <LoginContent />
        </Suspense>
    );
}
