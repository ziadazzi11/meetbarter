import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export function EventsPage() {
  const events = [
    {
      id: '1',
      title: 'Community Trade Fair - Brooklyn',
      date: 'Feb 20, 2026',
      time: '2:00 PM - 6:00 PM',
      location: 'Brooklyn Community Center',
      attendees: 145,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    },
    {
      id: '2',
      title: 'Skill Swap Workshop',
      date: 'Feb 25, 2026',
      time: '10:00 AM - 2:00 PM',
      location: 'Manhattan Hub',
      attendees: 67,
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Events</h1>
          <p className="text-muted-foreground">
            Meet fellow traders and participate in local events
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
                <Button className="w-full">Register</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
