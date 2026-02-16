import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Package,
  TrendingUp,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export function TradesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  const trades = {
    active: [
      {
        id: '1',
        title: 'Custom Desk for Logo Design',
        partner: 'Sarah Chen',
        partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        status: 'in-progress',
        progress: 60,
        valuePoints: 850,
        startDate: '5 days ago',
        nextAction: 'Waiting for delivery confirmation',
      },
      {
        id: '2',
        title: 'Photography for Web Development',
        partner: 'Mike Torres',
        partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        status: 'in-progress',
        progress: 30,
        valuePoints: 600,
        startDate: '2 weeks ago',
        nextAction: 'Awaiting your service delivery',
      },
    ],
    pending: [
      {
        id: '3',
        title: 'Bike Repair for Meal Prep',
        partner: 'Maria Garcia',
        partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        status: 'pending',
        valuePoints: 200,
        startDate: '3 days ago',
        nextAction: 'Waiting for partner approval',
      },
      {
        id: '4',
        title: 'Moving Help Request',
        partner: 'Chris Anderson',
        partnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        status: 'pending',
        valuePoints: 250,
        startDate: '1 day ago',
        nextAction: 'Respond to trade offer',
      },
    ],
    completed: [
      {
        id: '5',
        title: 'Camera for Design Services',
        partner: 'Jordan Lee',
        partnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        status: 'completed',
        valuePoints: 450,
        completedDate: '2 days ago',
        rating: 5,
      },
      {
        id: '6',
        title: 'Furniture Assembly Service',
        partner: 'Alex Rivera',
        partnerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        status: 'completed',
        valuePoints: 180,
        completedDate: '1 week ago',
        rating: 5,
      },
    ],
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const renderTradeCard = (trade: any) => (
    <motion.div
      key={trade.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={trade.partnerAvatar} alt={trade.partner} />
                <AvatarFallback>{trade.partner[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold mb-1">{trade.title}</h3>
                <p className="text-sm text-muted-foreground">with {trade.partner}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(trade.status)}
              <Badge
                variant={
                  trade.status === 'completed'
                    ? 'default'
                    : trade.status === 'in-progress'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {trade.status}
              </Badge>
            </div>
          </div>

          {trade.progress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{trade.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${trade.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {trade.startDate || trade.completedDate}
              </div>
              <div className="flex items-center gap-1 font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                {trade.valuePoints} VP
              </div>
            </div>
            <div className="flex gap-2">
              {trade.status === 'completed' ? (
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline">
                    Message
                  </Button>
                  <Button size="sm">
                    {trade.status === 'pending' ? 'Review' : 'Continue'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {trade.nextAction && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
              <span className="font-medium">Next Step:</span> {trade.nextAction}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Trades</h1>
          <p className="text-muted-foreground">
            Manage your ongoing and completed trades
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trades.active.length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trades.pending.length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trades.completed.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Package className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trades..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">
              Active ({trades.active.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({trades.pending.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({trades.completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {trades.active.length > 0 ? (
              trades.active.map(renderTradeCard)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No active trades</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {trades.pending.length > 0 ? (
              trades.pending.map(renderTradeCard)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No pending trades</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {trades.completed.length > 0 ? (
              trades.completed.map(renderTradeCard)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No completed trades yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
