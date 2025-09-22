import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, TrendingUp } from "lucide-react";

export default function FeaturedCreators() {
  const creators = [
    {
      name: "Alex Rivera",
      username: "@alexcreates",
      category: "Art",
      followers: "50K",
      tokenPrice: "0.025 ICP",
      priceChange: "+12.5%",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Maya Chen",
      username: "@mayamusic",
      category: "Music",
      followers: "35K",
      tokenPrice: "0.018 ICP",
      priceChange: "+8.2%",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Jake Thompson",
      username: "@jakegames",
      category: "Gaming",
      followers: "75K",
      tokenPrice: "0.042 ICP",
      priceChange: "+15.7%",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const categoryColors = {
    Art: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Music: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Gaming: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Featured Creators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {creators.map((creator, index) => (
          <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="flex items-start gap-3">
              <img 
                src={creator.avatar} 
                alt={creator.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white truncate">{creator.name}</h4>
                  <Badge className={categoryColors[creator.category]}>
                    {creator.category}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">{creator.username}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-3 h-3" />
                    {creator.followers}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{creator.tokenPrice}</div>
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      {creator.priceChange}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              View Token
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}