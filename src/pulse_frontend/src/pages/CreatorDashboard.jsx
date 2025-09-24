import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Coins,
  TrendingUp,
  Users,
  DollarSign,
  PlusCircle,
  Eye,
  Edit,
  ArrowUpRight,
  Bitcoin,
  AlertCircle,
  RefreshCw,
  Send,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import TokenCreationForm from "@/components/TokenCreationForm";
import CyberpunkTokenButton from "@/components/CyberpunkTokenButton";

const CreatorDashboard = () => {
  const { user, actor, isConnectedToBackend } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);
  
  // Backend state
  const [createdTokens, setCreatedTokens] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/tokens')) setSelectedTab('tokens');
    else if (path.includes('/analytics')) setSelectedTab('analytics');
    else if (path.includes('/revenue')) setSelectedTab('revenue');
    else if (path.includes('/community')) setSelectedTab('community');
    else setSelectedTab('overview');
  }, [location.pathname]);

  const handleTabChange = (value) => {
    setSelectedTab(value);
    if (value === 'overview') {
      navigate('/creator');
    } else {
      navigate(`/creator/${value}`);
    }
  };

  // Fetch creator's tokens and data from backend
  const fetchCreatorData = async () => {
    if (!actor || !user?.principal) {
      setError("Backend connection required");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch all tokens to find ones created by this user
      const allTokenIds = await actor.all_tokens();
      console.log("All token IDs:", allTokenIds);
      
      // Fetch tokens created by this user
      const creatorTokensData = [];
      
      for (const tokenId of allTokenIds) {
        try {
          const tokenInfo = await actor.token_info(Number(tokenId));
          if (tokenInfo && tokenInfo.length > 0) {
            const token = tokenInfo[0];
            
            // Check if this user created the token
            if (token.minting_account.toString() === user.principal.toString()) {
              const totalSupply = await actor.total_supply(Number(tokenId));
              const userBalance = await actor.balance_of(Number(tokenId), user.principal);
              
              // Mock additional data for display
              const mockPrice = 1 + (Number(tokenId) * 0.5);
              const mockChange24h = (Math.random() - 0.5) * 20;
              const mockHolders = Math.floor(Math.random() * 1000) + 50;
              const mockVolume24h = Math.floor(Math.random() * 50000) + 5000;
              
              creatorTokensData.push({
                id: tokenId.toString(),
                name: token.name,
                symbol: token.symbol,
                price: mockPrice,
                change24h: mockChange24h,
                supply: Number(totalSupply),
                holders: mockHolders,
                volume24h: mockVolume24h,
                marketCap: Number(totalSupply) * mockPrice,
                yourBalance: Number(userBalance),
                decimals: token.decimals,
                logoUrl: token.logo_url?.[0] || null,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching token ${tokenId}:`, err);
        }
      }
      
      setCreatedTokens(creatorTokensData);
      
      // Fetch user profile
      const profile = await actor.get_user_profile(user.principal);
      if (profile && profile.length > 0) {
        setUserProfile(profile[0]);
      }
      
      // Fetch platform stats
      const stats = await actor.get_stats();
      setPlatformStats(stats);
      
    } catch (err) {
      console.error("Error fetching creator data:", err);
      setError(err.message || "Failed to load creator data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (isConnectedToBackend) {
      fetchCreatorData();
    } else {
      setLoading(false);
      setError("Please connect to backend to access creator dashboard");
    }
  }, [actor, user?.principal, isConnectedToBackend]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCreatorData();
  };

  // Handle token actions
  const handleTokenAction = async (tokenId, action) => {
    if (!actor || !user?.principal) {
      setError("Backend connection required");
      return;
    }

    try {
      setError(null);
      
      if (action === 'transfer') {
        // In a real app, this would open a transfer modal
        console.log(`Transfer action for token ${tokenId}`);
      } else if (action === 'view') {
        // Navigate to token details
        navigate(`/token/${tokenId}`);
      } else if (action === 'edit') {
        // In a real app, this would open an edit modal
        console.log(`Edit action for token ${tokenId}`);
      }
      
    } catch (err) {
      console.error(`Error with ${action} action:`, err);
      setError(`Failed to ${action}: ${err.message}`);
    }
  };

  // Copy token ID to clipboard
  const copyToClipboard = async (text, label = "text") => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Mock recent transactions for creator
  const recentTransactions = createdTokens.slice(0, 3).map((token, index) => ({
    id: `tx-${index}`,
    type: ['mint', 'transfer', 'trade'][index % 3],
    amount: Math.floor(Math.random() * 2000) + 100,
    token: token.symbol,
    user: `${user.principal.toString().slice(0, 8)}...${user.principal.toString().slice(-4)}`,
    timestamp: ['2 hours ago', '4 hours ago', '6 hours ago'][index],
    value: (Math.floor(Math.random() * 2000) + 100) * token.price
  }));

  const totalValue = createdTokens.reduce((sum, token) => sum + (token.yourBalance * token.price), 0);
  const totalHolders = createdTokens.reduce((sum, token) => sum + token.holders, 0);
  const total24hVolume = createdTokens.reduce((sum, token) => sum + token.volume24h, 0);
  const totalMarketCap = createdTokens.reduce((sum, token) => sum + token.marketCap, 0);

  if (!isConnectedToBackend) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect to the backend to access the creator dashboard. Use the demo mode or connect with Internet Identity.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Manage your tokens and track performance.
            </p>
            {userProfile && (
              <p className="text-sm text-muted-foreground mt-1">
                Tokens created: {Number(userProfile.tokensCreated)} • 
                Role: {userProfile.role.Admin ? 'Admin' : userProfile.role.Creator ? 'Creator' : 'User'} •
                {userProfile.isVerified ? ' Verified' : ' Unverified'}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => setIsTokenFormOpen(true)}
              className="md:hidden hover:opacity-90 pulse-transition bg-purple-600">
              <Bitcoin className="w-4 h-4 mr-2" />
              Create Tokens
            </Button>
            <CyberpunkTokenButton render={setIsTokenFormOpen} />
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tokens">My Tokens</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-success">
                        ${totalValue.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <ArrowUpRight className="w-3 h-3 inline mr-1" />
                        +8.2% from last month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                  <Coins className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{createdTokens.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Total market cap: ${totalMarketCap.toLocaleString()}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Holders</CardTitle>
                  <Users className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{totalHolders.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        <ArrowUpRight className="w-3 h-3 inline mr-1" />
                        +12% this week
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${total24hVolume.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <ArrowUpRight className="w-3 h-3 inline mr-1" />
                        +5.4% from yesterday
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex items-center space-x-4 p-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                          </div>
                        ))}
                      </div>
                    ) : createdTokens.length === 0 ? (
                      <div className="text-center py-12">
                        <Coins className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-medium">No tokens created yet</h3>
                        <p className="text-muted-foreground">Create your first token to start building your creator economy.</p>
                        <Button 
                          className="mt-4" 
                          onClick={() => setIsTokenFormOpen(true)}
                        >
                          Create Token
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {createdTokens.map((token) => (
                          <div key={token.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={token.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} />
                                <AvatarFallback>{token.symbol}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{token.name}</h3>
                                <p className="text-sm text-muted-foreground">{token.symbol}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => copyToClipboard(token.id, "Token ID")}
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    ID: {token.id}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold">{token.holders}</div>
                              <p className="text-sm text-muted-foreground">holders</p>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold">${token.price.toFixed(2)}</span>
                                <Badge 
                                  variant={token.change24h > 0 ? "default" : "destructive"}
                                  className={token.change24h > 0 ? "bg-success text-success-foreground" : ""}
                                >
                                  {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Vol: ${token.volume24h.toLocaleString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleTokenAction(token.id, 'view')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleTokenAction(token.id, 'edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleTokenAction(token.id, 'transfer')}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest transactions and mints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1 flex-1">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                          </div>
                        ))}
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No recent activity</p>
                    ) : (
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
                              <p className="font-medium">${tx.value.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                {loading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-4">
                          <Skeleton className="h-32 w-full mb-4" />
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Your Created Tokens ({createdTokens.length})</h3>
                        <p className="text-muted-foreground">Manage settings, view analytics, and perform token operations</p>
                      </div>
                      <Button onClick={() => setIsTokenFormOpen(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create New Token
                      </Button>
                    </div>
                    
                    {createdTokens.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                        <Coins className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No tokens created yet</h3>
                        <p className="text-muted-foreground mb-4">Start building your creator economy by creating your first token.</p>
                        <Button onClick={() => setIsTokenFormOpen(true)}>
                          Create Your First Token
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {createdTokens.map((token) => (
                          <Card key={token.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={token.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} />
                                <AvatarFallback>{token.symbol}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{token.name}</h3>
                                <p className="text-sm text-muted-foreground">{token.symbol}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Price</span>
                                <span className="font-medium">${token.price.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">24h Change</span>
                                <Badge 
                                  variant={token.change24h > 0 ? "default" : "destructive"}
                                  className={token.change24h > 0 ? "bg-success text-success-foreground" : ""}
                                >
                                  {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Holders</span>
                                <span className="font-medium">{token.holders.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Your Balance</span>
                                <span className="font-medium">{token.yourBalance.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Market Cap</span>
                                <span className="font-medium">${token.marketCap.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleTokenAction(token.id, 'view')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleTokenAction(token.id, 'edit')}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => copyToClipboard(token.id, "Token ID")}
                              >
                                <Copy className="w-3 h-3 mr-2" />
                                Copy Token ID: {token.id}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Advanced analytics dashboard will include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Token price charts and historical data</li>
                    <li>Holder growth and demographics</li>
                    <li>Trading volume and liquidity metrics</li>
                    <li>Community engagement statistics</li>
                    <li>Revenue and earnings breakdown</li>
                    <li>Performance comparisons with other creators</li>
                  </ul>
                  {platformStats && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Platform Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Tokens:</span>
                          <div className="font-medium">{Number(platformStats.total_tokens)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Users:</span>
                          <div className="font-medium">{Number(platformStats.total_users)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Admins:</span>
                          <div className="font-medium">{Number(platformStats.admin_count)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Creators:</span>
                          <div className="font-medium">{Number(platformStats.creator_count)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Revenue dashboard will include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Token sales and transaction fees</li>
                    <li>Creator royalties and commissions</li>
                    <li>Subscription and premium content revenue</li>
                    <li>Staking rewards and yield farming</li>
                    <li>Cross-platform integration earnings</li>
                    <li>Tax reporting and documentation</li>
                  </ul>
                  
                  {createdTokens.length > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Estimated Revenue Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Token Value:</span>
                          <div className="font-medium text-lg">${totalValue.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">24h Volume:</span>
                          <div className="font-medium text-lg">${total24hVolume.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Market Cap:</span>
                          <div className="font-medium text-lg">${totalMarketCap.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Community tools will include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Token holder communication channels</li>
                    <li>Governance proposals and voting</li>
                    <li>Exclusive content and perks for holders</li>
                    <li>Community challenges and rewards</li>
                    <li>Holder verification and tiers</li>
                    <li>Social media integration and management</li>
                  </ul>
                  
                  {createdTokens.length > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Community Overview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Holders Across All Tokens:</span>
                          <div className="font-medium text-lg">{totalHolders.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active Tokens:</span>
                          <div className="font-medium text-lg">{createdTokens.length}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Token Distribution</h5>
                        <div className="space-y-2">
                          {createdTokens.map((token) => (
                            <div key={token.id} className="flex justify-between items-center">
                              <span className="text-muted-foreground">{token.name} ({token.symbol})</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{token.holders} holders</span>
                                <Badge variant="outline" className="text-xs">
                                  {((token.holders / totalHolders) * 100).toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TokenCreationForm 
        open={isTokenFormOpen}
        onOpenChange={setIsTokenFormOpen}
        onTokenCreated={fetchCreatorData}
      />
    </div>
  );
};

export default CreatorDashboard;