import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Coins,
  TrendingUp,
  Users,
  DollarSign,
  PlusCircle,
  Eye,
  Edit,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import TokenCreationForm from "@/components/TokenCreationForm";

const CreatorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);

  // Update selected tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/tokens')) setSelectedTab('tokens');
    else if (path.includes('/analytics')) setSelectedTab('analytics');
    else if (path.includes('/revenue')) setSelectedTab('revenue');
    else if (path.includes('/community')) setSelectedTab('community');
    else setSelectedTab('overview');
  }, [location.pathname]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (value === 'overview') {
      navigate('/creator');
    } else {
      navigate(`/creator/${value}`);
    }
  };
  
  // Mock data - in real app, this would come from ICP canisters
  const [tokens] = useState([
    {
      id: '1',
      name: 'CreatorCoin',
      symbol: 'CC',
      price: 2.45,
      change24h: 12.5,
      supply: 1000000,
      holders: 1234,
      volume24h: 25678.90,
      marketCap: 2450000,
      yourBalance: 150000,
    },
    {
      id: '2',
      name: 'PulseToken',
      symbol: 'PULSE',
      price: 0.87,
      change24h: -3.2,
      supply: 5000000,
      holders: 456,
      volume24h: 8930.50,
      marketCap: 4350000,
      yourBalance: 75000,
    }
  ]);

  const [recentTransactions] = useState([
    {
      id: '1',
      type: 'mint',
      amount: 1000,
      token: 'CC',
      user: '0x1234...5678',
      timestamp: '2 hours ago',
      value: 2450.00
    },
    {
      id: '2',
      type: 'trade',
      amount: 500,
      token: 'PULSE',
      user: '0x8765...4321',
      timestamp: '4 hours ago',
      value: 435.00
    },
    {
      id: '3',
      type: 'mint',
      amount: 2000,
      token: 'CC',
      user: '0x9999...1111',
      timestamp: '6 hours ago',
      value: 4900.00
    }
  ]);

  const totalValue = tokens.reduce((sum, token) => sum + (token.yourBalance * token.price), 0);
  const totalHolders = tokens.reduce((sum, token) => sum + token.holders, 0);
  const total24hVolume = tokens.reduce((sum, token) => sum + token.volume24h, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Manage your tokens and track performance.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button 
              className="pulse-gradient hover:opacity-90 pulse-transition"
              onClick={() => setIsTokenFormOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Token
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tokens">My Tokens</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ${totalValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 inline mr-1" />
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                  <Coins className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tokens.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {tokens.length > 1 ? 'multiple' : '1'} token{tokens.length > 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Holders</CardTitle>
                  <Users className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHolders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 inline mr-1" />
                    +12% this week
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${total24hVolume.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 inline mr-1" />
                    +5.4% from yesterday
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Your Tokens */}
              <div className="xl:col-span-2">
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Tokens</CardTitle>
                        <CardDescription>Manage and monitor your created tokens</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tokens.map((token) => (
                        <div key={token.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} />
                              <AvatarFallback>{token.symbol}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{token.name}</h3>
                              <p className="text-sm text-muted-foreground">{token.symbol}</p>
                            </div>
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
                              {token.holders} holders
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest transactions and mints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'mint' ? 'bg-success/20' : 'bg-primary/20'
                            }`}>
                              {tx.type === 'mint' ? (
                                <PlusCircle className="w-4 h-4 text-success" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium capitalize">{tx.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {tx.amount} {tx.token}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${tx.value}</p>
                            <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Manage Your Tokens</CardTitle>
                <CardDescription>Create, edit, and monitor your creator tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Token management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed analytics for your tokens and community</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Revenue Tracking</CardTitle>
                <CardDescription>Monitor your earnings and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Revenue tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Community Management</CardTitle>
                <CardDescription>Engage with your token holders and fans</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Community tools coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Token Creation Form Modal */}
      <TokenCreationForm 
        open={isTokenFormOpen}
        onOpenChange={setIsTokenFormOpen}
      />
    </div>
  );
};

export default CreatorDashboard;