import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Zap, DollarSign } from "lucide-react";

export default function PlatformStats() {
  const stats = [
    {
      title: "Total Volume",
      value: "12.5K ICP",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Active Tokens",
      value: "1,240",
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "Creators",
      value: "850",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      title: "24h Growth",
      value: "+18.3%",
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-gray-900/50 backdrop-blur border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-white font-bold text-xl">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}