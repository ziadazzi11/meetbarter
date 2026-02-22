"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Chrome, Facebook, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreeToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        setIsLoading(true);

        try {
            await signup(name, email, password);
            // Success is usually handled by auth context or redirect
            // toast.success('Account created! Welcome to TrustTrade'); 
            router.push('/dashboard');
        } catch (error) {
            toast.error('Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignup = (provider: 'Google' | 'Facebook') => {
        // Redirect to backend OAuth endpoint which handles the handshake
        if (provider === 'Google') {
            window.location.href = `${API_BASE_URL}/auth/google`;
        } else if (provider === 'Facebook') {
            window.location.href = `${API_BASE_URL}/auth/facebook`;
        }
    };

    const benefits = [
        'Access to trusted community traders',
        'Build your reputation with every trade',
        'Free to join and list items',
        'Secure messaging and verification',
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl"
            >
                <Link href="/" className="flex items-center justify-center mb-8">
                    <img src="/assets/logo horizental color-03.png" alt="MeetBarter" className="h-12 w-auto" />
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Benefits Column */}
                    <div className="hidden md:flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-4">
                                Join Our Trading Community
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Start trading goods, services, and skills with trusted community members today.
                            </p>

                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={benefit}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 flex-shrink-0 mt-0.5">
                                            <Check className="h-4 w-4 text-green-500" />
                                        </div>
                                        <p className="text-sm">{benefit}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                                <p className="text-sm italic text-muted-foreground">
                                    "Join us in building a compassionate economy. Your skills and goods have value here, regardless of market prices."
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Signup Form Column */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Create Account</CardTitle>
                            <CardDescription>
                                Get started with your free account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 8 characters
                                    </p>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={agreeToTerms}
                                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm font-normal cursor-pointer leading-tight"
                                    >
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-primary hover:underline">
                                            Terms of Service
                                        </Link>
                                        {' '}and{' '}
                                        <Link href="/privacy" className="text-primary hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </Label>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <Separator />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                                    Or sign up with
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleSocialSignup('Google')}
                                    className="w-full"
                                >
                                    <Chrome className="mr-2 h-4 w-4" />
                                    Google
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleSocialSignup('Facebook')}
                                    className="w-full"
                                >
                                    <Facebook className="mr-2 h-4 w-4" />
                                    Facebook
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <p className="text-sm text-center text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
