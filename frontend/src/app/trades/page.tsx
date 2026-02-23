"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Filter, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function TradesPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto py-12 px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            My Trades
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Track and manage your active negotiations and trade history
                        </p>
                    </div>
                    <Link href="/listings/create">
                        <Button className="shadow-lg hover:shadow-primary/20 transition-all">
                            <Package className="h-5 w-5 mr-2" />
                            Create New Listing
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="active" className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-4">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="active" className="px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                                <Clock className="h-4 w-4 mr-2" />
                                Active
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="px-6 py-2.5 data-[state=active]:bg-yellow-500 data-[state=active]:text-white transition-all">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Pending
                                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">0</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="history" className="px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                History
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    placeholder="Search trades..."
                                    className="pl-9 pr-4 py-2 bg-muted/30 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <TabsContent value="active" className="space-y-6 focus-visible:outline-none">
                            <Card className="border-dashed bg-muted/10">
                                <CardContent className="py-20 text-center">
                                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <Package className="h-10 w-10 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-2">Ready to trade?</h3>
                                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                        You don't have any active negotiations. Browse the marketplace to find items you want to swap for.
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Link href="/listings">
                                            <Button variant="default" className="px-8">Explore Marketplace</Button>
                                        </Link>
                                        <Link href="/listings/create">
                                            <Button variant="outline" className="px-8">List an Item</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pending" className="focus-visible:outline-none">
                            <Card className="border-dashed bg-muted/10">
                                <CardContent className="py-20 text-center">
                                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle className="h-10 w-10 text-yellow-500" />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-2">No pending requests</h3>
                                    <p className="text-muted-foreground mb-4">When others want to trade with you, their requests will appear here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="focus-visible:outline-none">
                            <Card className="border-dashed bg-muted/10">
                                <CardContent className="py-20 text-center">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="h-10 w-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-2">Trade History</h3>
                                    <p className="text-muted-foreground mb-4">You haven't completed any trades yet. Your successful swaps will be listed here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
