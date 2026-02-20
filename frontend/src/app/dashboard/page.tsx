"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Package,
    MessageSquare,
    Star,
    AlertCircle,
    Plus,
    ArrowRight,
    CheckCircle,
    Clock,
    XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
    const { user } = useAuth();

    const stats = [
        { label: 'Total Trades', value: user?.totalTrades || 0, icon: Package, change: '+0%', color: 'text-blue-500' },
        { label: 'Trust Score', value: user?.trustScore || 0, icon: Star, change: '+0 pts', color: 'text-yellow-500' },
        { label: 'Active Listings', value: 0, icon: TrendingUp, change: '+0', color: 'text-green-500' },
        { label: 'Messages', value: 0, icon: MessageSquare, change: '0 new', color: 'text-purple-500' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'in-progress':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-muted-foreground">
                            Here's what's happening with your trades today
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/listings/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Listing
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Verification Alert */}
                {(!user?.phoneVerified || (user?.trustScore || 0) < 50) && (
                    <Alert className="mb-8 border-blue-500/50 bg-blue-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-center justify-between w-full">
                                <span>
                                    Increase your trust score by verifying your phone and identity
                                </span>
                                <Link href="/verification/institutional">
                                    <Button size="sm" variant="outline">
                                        Verify Now
                                    </Button>
                                </Link>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                        <Badge variant="secondary" className="text-xs">
                                            {stat.change}
                                        </Badge>
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/trades'}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-500" />
                                    Active Trades
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats[0].value}</p>
                                {Number(stats[0].value) === 0 ? (
                                    <p className="text-muted-foreground text-sm mt-1">No active trades yet. Start exploring!</p>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Negotiations in progress</p>
                                )}
                                <Button variant="link" className="px-0 mt-2 text-primary">
                                    Manage Trades <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/profile/${user?.id || ''}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-green-500" />
                                    My Listings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats[2].value || '0'}</p>
                                <p className="text-muted-foreground text-sm">Active items in store</p>
                                <Button variant="link" className="px-0 mt-2 text-primary">
                                    View Store <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trust Score Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Trust Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-4">
                                    <div className="text-5xl font-bold text-primary mb-2">
                                        {user?.trustScore || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Excellent Standing</p>
                                </div>
                                <Progress value={user?.trustScore || 0} className="mb-4" />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Completed Trades</span>
                                        <span className="font-medium">0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Success Rate</span>
                                        <span className="font-medium">100%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Member Since</span>
                                        <span className="font-medium">
                                            {new Date().toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full mt-4">
                                    Improve Score
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="/listings/create?type=offer">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Package className="h-4 w-4 mr-2" />
                                        Create Offer
                                    </Button>
                                </Link>
                                <Link href="/listings/create?type=request">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Request
                                    </Button>
                                </Link>
                                <Link href="/trades">
                                    <Button variant="outline" className="w-full justify-start">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        My Trades
                                    </Button>
                                </Link>
                                <Link href="/messages">
                                    <Button variant="outline" className="w-full justify-start">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        View Messages
                                    </Button>
                                </Link>
                                <Link href="/settings">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Star className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
