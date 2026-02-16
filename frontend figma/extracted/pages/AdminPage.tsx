import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router';

export function AdminPage() {
  const { user } = useAuth();

  // In a real app, check if user is admin
  const isAdmin = user?.email?.includes('admin'); // Mock check

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = [
    { label: 'Total Users', value: '12,450', icon: Users, change: '+245', color: 'text-blue-500' },
    { label: 'Active Listings', value: '3,280', icon: Package, change: '+89', color: 'text-green-500' },
    { label: 'Pending Reports', value: '23', icon: AlertTriangle, change: '+5', color: 'text-red-500' },
    { label: 'Total VP Traded', value: '2.4M', icon: TrendingUp, change: '+12%', color: 'text-purple-500' },
    { label: 'Verified Users', value: '8,920', icon: Shield, change: '+134', color: 'text-yellow-500' },
    { label: 'Daily Active', value: '2,140', icon: Activity, change: '+8%', color: 'text-cyan-500' },
  ];

  const recentReports = [
    { id: '1', type: 'Fraud', user: 'User#1234', status: 'pending', severity: 'high' },
    { id: '2', type: 'Spam', user: 'User#5678', status: 'reviewing', severity: 'low' },
    { id: '3', type: 'Harassment', user: 'User#9012', status: 'pending', severity: 'medium' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and moderation tools</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <Badge variant="secondary">{stat.change}</Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{report.type}</p>
                      <p className="text-sm text-muted-foreground">{report.user}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          report.severity === 'high'
                            ? 'destructive'
                            : report.severity === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {report.severity}
                      </Badge>
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Review Listings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Handle Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Verification Queue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
