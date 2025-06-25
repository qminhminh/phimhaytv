'use client';

import { useState } from 'react';
import { User, Heart, Clock, Settings, Download, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import MovieCard from '../../components/shared/MovieCard';
import { Movie } from '@/lib/api';

// Sample user data
const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  joinDate: "January 2023",
  watchTime: "124 hours",
  favoriteGenre: "Sci-Fi"
};

const watchHistory = [
  {
    id: "1",
    title: "Inception",
    poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2010",
    genre: "Sci-Fi, Thriller",
    rating: "PG-13",
    type: "movie" as const,
    watchedAt: "2 days ago"
  },
  {
    id: "4",
    title: "Stranger Things",
    poster: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: "2016",
    genre: "Drama, Horror",
    rating: "TV-14",
    type: "tv" as const,
    watchedAt: "1 week ago"
  }
];

const myList: Movie[] = [
  {
    _id: "2",
    name: "The Matrix",
    origin_name: "The Matrix",
    slug: "the-matrix",
    thumb_url: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    poster_url: "https://images.pexels.com/photos/7991663/pexels-photo-7991663.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: 1999,
    category: ["Action", "Sci-Fi"],
    country: ["USA"],
    type: "single",
    status: "Completed",
    sub_docquyen: false,
    chieurap: true,
    trailer_url: "",
    time: "136 min",
    episode_current: "Full",
    episode_total: "1",
    quality: "HD",
    lang: "Vietsub",
    content: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    modified: {
      time: "2023-10-27T04:08:16.000Z"
    }
  },
  {
    _id: "3",
    name: "Interstellar",
    origin_name: "Interstellar",
    slug: "interstellar",
    thumb_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    poster_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    year: 2014,
    category: ["Adventure", "Drama", "Sci-Fi"],
    country: ["USA"],
    type: "single",
    status: "Completed",
    sub_docquyen: false,
    chieurap: true,
    trailer_url: "",
    time: "169 min",
    episode_current: "Full",
    episode_total: "1",
    quality: "HD",
    lang: "Vietsub",
    content: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    modified: {
      time: "2023-10-26T14:20:05.000Z"
    }
  }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#121212] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-[#1A1A1A] rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-[#FFD700] rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-[#121212]" />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-[#EAEAEA] mb-2">{userData.name}</h1>
              <p className="text-[#A0A0A0] mb-4">{userData.email}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#FFD700]">{userData.watchTime}</p>
                  <p className="text-[#A0A0A0] text-sm">Watch Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FFD700]">{watchHistory.length}</p>
                  <p className="text-[#A0A0A0] text-sm">Watched</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FFD700]">{myList.length}</p>
                  <p className="text-[#A0A0A0] text-sm">My List</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FFD700]">{userData.favoriteGenre}</p>
                  <p className="text-[#A0A0A0] text-sm">Favorite Genre</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#121212]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
        
        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-[#1A1A1A] mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#121212]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#121212]">
              My List
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#121212]">
              Watch History
            </TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#121212]">
              Downloads
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                <CardHeader>
                  <CardTitle className="text-[#EAEAEA] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#FFD700]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchHistory.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-[#EAEAEA] font-medium">{item.title}</p>
                          <p className="text-[#A0A0A0] text-sm">{item.watchedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                <CardHeader>
                  <CardTitle className="text-[#EAEAEA] flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#FFD700]" />
                    Viewing Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">Total Watch Time</span>
                      <span className="text-[#EAEAEA] font-medium">{userData.watchTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">Movies Watched</span>
                      <span className="text-[#EAEAEA] font-medium">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">TV Shows Watched</span>
                      <span className="text-[#EAEAEA] font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">Member Since</span>
                      <span className="text-[#EAEAEA] font-medium">{userData.joinDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="watchlist">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {myList.map((item) => (
                <MovieCard key={item._id} movie={item} />
              ))}
            </div>
            {myList.length === 0 && (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-[#A0A0A0] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">Your list is empty</h3>
                <p className="text-[#A0A0A0]">Add movies and TV shows to your list to watch later</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              {watchHistory.map((item) => (
                <div key={item.id} className="bg-[#1A1A1A] rounded-lg p-4 flex items-center gap-4">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-[#EAEAEA] font-semibold text-lg">{item.title}</h3>
                    <p className="text-[#A0A0A0] mb-2">{item.genre} • {item.year}</p>
                    <p className="text-[#A0A0A0] text-sm">Watched {item.watchedAt}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#121212]"
                  >
                    Watch Again
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="downloads">
            <div className="text-center py-16">
              <Download className="w-16 h-16 text-[#A0A0A0] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">No downloads yet</h3>
              <p className="text-[#A0A0A0]">Download movies and shows to watch offline</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}