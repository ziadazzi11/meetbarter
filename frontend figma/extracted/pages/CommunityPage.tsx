import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Users, MessageSquare, ThumbsUp, Clock, TrendingUp } from 'lucide-react';

export function CommunityPage() {
  const discussions = [
    {
      id: '1',
      title: 'Tips for successful trades with first-time traders',
      author: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      replies: 23,
      likes: 45,
      time: '2h ago',
      category: 'Tips & Tricks',
    },
    {
      id: '2',
      title: 'How to build trust score quickly?',
      author: 'Mike Torres',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      replies: 15,
      likes: 32,
      time: '5h ago',
      category: 'Questions',
    },
    {
      id: '3',
      title: 'Success Story: Traded my way to a new home office setup!',
      author: 'Jordan Lee',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      replies: 41,
      likes: 128,
      time: '1d ago',
      category: 'Success Stories',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect, share, and learn from fellow traders
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={discussion.avatar} alt={discussion.author} />
                      <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold mb-1">{discussion.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{discussion.author}</span>
                            <span>•</span>
                            <span>{discussion.time}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">{discussion.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{discussion.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{discussion.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Trust Building', 'Safety Tips', 'Trading Stories', 'Local Meetups'].map((topic) => (
                  <Button key={topic} variant="outline" className="w-full justify-start">
                    #{topic}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">12,450</p>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">2,340</p>
                  <p className="text-sm text-muted-foreground">Discussions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
