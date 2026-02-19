"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function TradesPage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Trades</h1>
                    <p className="text-muted-foreground">Manage your ongoing and past exchanges</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/listings/create">
                        <Button>
                            <Package className="h-4 w-4 mr-2" />
                            New Trade
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>

                <TabsContent value="active" className="space-y-4">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No active trades</h3>
                            <p className="text-muted-foreground mb-4">You don't have any trade negotiations in progress.</p>
                            <Link href="/listings">
                                <Button variant="outline">Browse Listings</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <h3 className="text-lg font-medium mb-1">No pending requests</h3>
                            <p className="text-muted-foreground">Incoming trade requests will appear here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <h3 className="text-lg font-medium mb-1">No trade history</h3>
                            <p className="text-muted-foreground">Completed trades will be archived here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
