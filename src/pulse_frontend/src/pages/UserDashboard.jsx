import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  TrendingUp,
  Search,
  Star,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bitcoin,
  Minus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";

const UserDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("portfolio");

  // Update selected tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/trades')) setSelectedTab('trades');
    else if (path.includes('/watchlist')) setSelectedTab('watchlist');
    else setSelectedTab('portfolio');
  }, [location.pathname]);

  // Handle tab change and update URL
  const handleTabChange = (value) => {
    setSelectedTab(value);
    if (value === 'portfolio') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${value}`);
    }
  };
  
  // Mock data
  const [portfolio] = useState([
    {
      id: '1',
      name: 'CreatorCoin',
      symbol: 'CC',
      creator: 'TechGuru',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techguru',
      price: 2.45,
      change24h: 12.5,
      holdings: 150,
      value: 367.50,
      allocation: 45.2,
    },
    {
      id: '2',
      name: 'ArtToken',
      symbol: 'ART',
      creator: 'DigitalArtist',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
      price: 1.87,
      change24h: -3.2,
      holdings: 200,
      value: 374.00,
      allocation: 46.0,
    },
    {
      id: '3',
      name: 'GameToken',
      symbol: 'GAME',
      creator: 'GameDev',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamedev',
      price: 0.35,
      change24h: 8.7,
      holdings: 500,
      value: 175.00,
      allocation: 21.5,
    }
  ]);

  const [trendingTokens] = useState([
    {
      id: '4',
      name: 'MusicCoin',
      symbol: 'MUSIC',
      creator: 'Musician',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musician',
      price: 3.22,
      change24h: 45.6,
      volume24h: 125000,
      holders: 892,
    },
    {
      id: '5',
      name: 'ComedyCoin',
      symbol: 'FUNNY',
      creator: 'ComedianX',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=comedian',
      price: 0.95,
      change24h: 23.1,
      volume24h: 89000,
      holders: 1234,
    },
    {
      id: '6',
      name: 'CookToken',
      symbol: 'COOK',
      creator: 'ChefMaster',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef',
      price: 1.56,
      change24h: 15.3,
      volume24h: 67000,
      holders: 567,
    }
  ]);

  const [recentTrades] = useState([
    {
      id: '1',
      type: 'buy',
      token: 'CC',
      amount: 50,
      price: 2.40,
      timestamp: '2 hours ago',
      value: 120.00
    },
    {
      id: '2',
      type: 'sell',
      token: 'ART',
      amount: 25,
      price: 1.90,
      timestamp: '1 day ago',
      value: 47.50
    },
    {
      id: '3',
      type: 'buy',
      token: 'GAME',
      amount: 100,
      price: 0.32,
      timestamp: '2 days ago',
      value: 32.00
    }
  ]);

  const totalValue = portfolio.reduce((sum, token) => sum + token.value, 0);
  const totalGainLoss = portfolio.reduce((sum, token) => sum + (token.value * token.change24h / 100), 0);
  const totalGainLossPercent = (totalGainLoss / totalValue) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Portfolio</h1>
            <p className="text-muted-foreground">
              Track your creator token investments and discover new opportunities.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tokens..." className="pl-10 w-64" />
            </div>
            <Button className=" hover:opacity-90 pulse-transition bg-purple-600 ">
              <Bitcoin className="w-4 h-4 mr-2" />
              Create Tokens
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalValue.toFixed(2)}
                  </div>
                  <p className={`text-xs flex items-center ${
                    totalGainLossPercent >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {totalGainLossPercent >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}% (${totalGainLoss.toFixed(2)})
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tokens Owned</CardTitle>
                  <Star className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{portfolio.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {portfolio.length} different creators
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">CC</div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% in 24h
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Your Holdings */}
              <div className="xl:col-span-2">
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Holdings</CardTitle>
                        <CardDescription>Your creator token portfolio</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {portfolio.map((token) => (
                        <div key={token.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={token.creatorAvatar} />
                              <AvatarFallback>{token.symbol}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{token.name}</h3>
                              <p className="text-sm text-muted-foreground">by {token.creator}</p>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-semibold">{token.holdings}</div>
                            <p className="text-sm text-muted-foreground">{token.symbol}</p>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold">${token.price}</span>
                              <Badge 
                                variant={token.change24h > 0 ? "default" : "destructive"}
                                className={token.change24h > 0 ? "bg-success text-success-foreground" : ""}
                              >
                                {token.change24h > 0 ? '+' : ''}{token.change24h}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ${token.value.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-success hover:text-success">
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending Tokens */}
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <CardTitle>Trending Tokens</CardTitle>
                    <CardDescription>Most popular creator tokens today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trendingTokens.map((token) => (
                        <div key={token.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={token.creatorAvatar} />
                              <AvatarFallback>{token.symbol}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{token.symbol}</p>
                              <p className="text-xs text-muted-foreground">{token.creator}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${token.price}</p>
                            <Badge 
                              variant="default"
                              className="bg-success text-success-foreground text-xs"
                            >
                              +{token.change24h}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Trades */}
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <CardTitle>Recent Trades</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTrades.map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              trade.type === 'buy' ? 'bg-success/20' : 'bg-destructive/20'
                            }`}>
                              {trade.type === 'buy' ? (
                                <Plus className="w-4 h-4 text-success" />
                              ) : (
                                <Minus className="w-4 h-4 text-destructive" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium capitalize">
                                {trade.type} {trade.token}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {trade.amount} @ ${trade.price}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${trade.value}</p>
                            <p className="text-xs text-muted-foreground">{trade.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>Your complete trading history and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Trade history interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Your Watchlist</CardTitle>
                <CardDescription>Tokens you're following and considering for investment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Watchlist feature coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;