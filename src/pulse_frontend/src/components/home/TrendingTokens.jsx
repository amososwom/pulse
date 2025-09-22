import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingTokens({ tokens, isLoading }) {
  const categoryColors = {
    gaming: "bg-red-500/20 text-red-400 border-red-500/30",
    art: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    music: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    sports: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    lifestyle: "bg-green-500/20 text-green-400 border-green-500/30",
    tech: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    other: "bg-gray-500/20 text-gray-400 border-gray-500/30"
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Trending Creator Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-800 last:border-b-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full bg-gray-800" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2 bg-gray-800" />
                    <Skeleton className="h-3 w-24 bg-gray-800" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1 bg-gray-800" />
                    <Skeleton className="h-3 w-12 bg-gray-800" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            tokens.map((token, index) => (
              <Link 
                key={token.id} 
                to={createPageUrl(`Token?id=${token.id}`)}
                className="block hover:bg-gray-800/50 transition-colors duration-200"
              >
                <div className="p-4 border-b border-gray-800 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {token.symbol?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{token.name}</h3>
                        <Badge className={categoryColors[token.category] || categoryColors.other}>
                          {token.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {token.holders_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {token.volume_24h?.toFixed(2) || '0'} ICP
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {token.current_price?.toFixed(4) || '0'} ICP
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        (token.price_change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(token.price_change_24h || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(token.price_change_24h || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}