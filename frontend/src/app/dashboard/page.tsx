"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { UserIdentityBadge } from '@/components/UserIdentityBadge';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardStats {
    totalTrades: number;
    trustScore: number;
    activeListings: number;
    messages: number;
    walletBalance: number;
    userAchievements: any[];
}

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalTrades: 0,
        trustScore: 0,
        activeListings: 0,
        messages: 0,
        walletBalance: 0,
        userAchievements: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || !token) return;
            try {
                // Fetch actual counts from backend
                const [listingsRes, tradesRes, profileRes] = await Promise.all([
                    apiClient.fetch(`${API_BASE_URL}/listings?sellerId=${user.id}&status=ACTIVE`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    apiClient.fetch(`${API_BASE_URL}/trades?userId=${user.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    apiClient.fetch(`${API_BASE_URL}/users/${user.id}/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (listingsRes.ok && tradesRes.ok && profileRes.ok) {
                    const listingsData = await listingsRes.json();
                    const tradesData = await tradesRes.json();
                    const profileData = await profileRes.json();

                    setDashboardStats({
                        totalTrades: tradesData.length || 0,
                        trustScore: user.globalTrustScore || 0,
                        activeListings: listingsData.length || 0,
                        messages: 0,
                        walletBalance: user.walletBalance || 0,
                        userAchievements: profileData.profile?.userAchievements || []
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };

        fetchStats();
    }, [user, token]);

    const stats = [
        { label: 'Value Points', value: `${dashboardStats.walletBalance || 0} VP`, icon: Star, change: '+0', color: 'text-purple-500' },
        { label: 'Trust Score', value: (dashboardStats.trustScore || 0).toFixed(1), icon: Star, change: '+0 pts', color: 'text-yellow-500' },
        { label: 'Active Listings', value: dashboardStats.activeListings, icon: Package, change: '+0', color: 'text-green-500' },
        { label: 'Total Trades', value: dashboardStats.totalTrades, icon: TrendingUp, change: '+0%', color: 'text-blue-500' },
    ];

    // Unused helper removed to fix lint

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-3xl font-bold">
                            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                        </h1>
                        {user && (
                            <div className="max-w-md">
                                <UserIdentityBadge
                                    user={{
                                        id: user.id,
                                        fullName: user.fullName,
                                        globalTrustScore: user.globalTrustScore || 0,
                                        completedTrades: dashboardStats.totalTrades,
                                        country: user.country,
                                        idCardStatus: user.idCardStatus,
                                        userAchievements: dashboardStats.userAchievements
                                    }}
                                    size="sm"
                                    showCountry={false}
                                />
                            </div>
                        )}
                        <p className="text-muted-foreground">
                            Here&apos;s what&apos;s happening with your trades today
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
                {(user?.idCardStatus !== 'VERIFIED' || !user?.phoneVerified) && (
                    <Alert className="mb-8 border-yellow-500/50 bg-yellow-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-center justify-between w-full">
                                <span>
                                    {user?.idCardStatus === 'PENDING'
                                        ? "Your ID verification is pending review. Hang tight!"
                                        : "Complete your identity verification to unlock full trading potential and increase trust."}
                                </span>
                                {user?.idCardStatus !== 'VERIFIED' && user?.idCardStatus !== 'PENDING' && (
                                    <Link href="/verification/id-upload">
                                        <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-600 hover:text-white">
                                            Verify Identity
                                        </Button>
                                    </Link>
                                )}
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
                                        {(user?.globalTrustScore || 1.0).toFixed(1)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {(user?.globalTrustScore || 1.0) >= 4.0 ? 'Excellent' :
                                            (user?.globalTrustScore || 1.0) >= 3.0 ? 'Good' : 'Fair'} Standing
                                    </p>
                                </div>
                                <Progress value={(user?.globalTrustScore || 1.0) * 20} className="mb-4" />
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

                        {/* Achievements Card (NEW) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Badge className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/30">
                                        <Star className="h-3 w-3 mr-1" />
                                    </Badge>
                                    Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Early Pioneer</p>
                                            <p className="text-xs text-muted-foreground">Joined in Beta</p>
                                        </div>
                                    </div>
                                    {/* Placeholder for more achievements */}
                                    <p className="text-xs text-center text-muted-foreground italic">
                                        Complete more trades to unlock badges!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
