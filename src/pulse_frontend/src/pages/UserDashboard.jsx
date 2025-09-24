import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import CyberpunkTokenButton from "@/components/CyberpunkTokenButton";
import TokenCreationForm from "@/components/TokenCreationForm";

const UserDashboard = () => {
  const { user, actor, isConnectedToBackend } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("portfolio");
  const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);
  
  // Backend state
  const [portfolio, setPortfolio] = useState([]);
  const [allTokens, setAllTokens] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Validate principal format
  const isValidPrincipal = (principal) => {
    if (!principal) return false;
    
    // Convert to string if it's a Principal object
    const principalStr = principal.toString ? principal.toString() : principal;
    
    // More permissive validation for IC principal format
    // IC principals are base32 encoded strings with hyphens as separators
    // They can have various lengths and ending patterns
    if (typeof principalStr !== 'string') return false;
    if (principalStr.length < 27) return false; // Minimum length check
    
    // Check for valid base32 characters and hyphen structure
    const principalRegex = /^[a-z0-9-]+$/;
    const hasValidStructure = principalRegex.test(principalStr) && 
                              principalStr.includes('-') && 
                              !principalStr.startsWith('-') && 
                              !principalStr.endsWith('-') &&
                              !principalStr.includes('--'); // No double hyphens
    
    return hasValidStructure;
  };

  // Convert principal to proper format for backend calls
  const formatPrincipal = (principal) => {
    if (!principal) return null;
    
    // If it's already a Principal object, return as is
    if (principal.toString && typeof principal.toString === 'function') {
      return principal;
    }
    
    // If it's a string, try to create Principal from it
    try {
      // In a real app, you'd use: import { Principal } from '@dfinity/principal';
      // For now, we'll use the string directly since the backend expects Principal type
      return principal;
    } catch (err) {
      console.error("Invalid principal format:", err);
      return null;
    }
  };

  // Fetch user portfolio and tokens from backend
  const fetchPortfolioData = async () => {
    if (!actor) {
      setError("Backend connection required");
      setLoading(false);
      return;
    }

    if (!user?.principal) {
      setError("No user principal available");
      setLoading(false);
      return;
    }

    // Validate principal format
    if (!isValidPrincipal(user.principal)) {
      setError(`Invalid principal format: ${user.principal}. Please reconnect with Internet Identity.`);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("Fetching data for principal:", user.principal);
      
      const userPrincipal = formatPrincipal(user.principal);
      if (!userPrincipal) {
        throw new Error("Could not format principal for backend call");
      }

      // Fetch all tokens
      const tokenIds = await actor.all_tokens();
      console.log("All token IDs:", tokenIds);
      
      // Fetch user's token balances
      const userTokens = await actor.get_user_tokens(userPrincipal);
      console.log("User tokens:", userTokens);
      
      // Fetch detailed token info for user's tokens
      const portfolioData = await Promise.all(
        userTokens.map(async ([tokenId, balance]) => {
          try {
            const tokenInfo = await actor.token_info(Number(tokenId));
            const totalSupply = await actor.total_supply(Number(tokenId));
            
            if (tokenInfo && tokenInfo.length > 0) {
              const token = tokenInfo[0];
              
              // Mock price calculation (in real app, get from price oracle)
              const mockPrice = 1 + (Number(tokenId) * 0.5);
              const mockChange24h = (Math.random() - 0.5) * 20; // -10% to +10%
              
              return {
                id: tokenId.toString(),
                name: token.name,
                symbol: token.symbol,
                creator: token.minting_account.toString().slice(0, 8) + "...",
                creatorPrincipal: token.minting_account.toString(),
                creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${token.minting_account.toString()}`,
                price: mockPrice,
                change24h: mockChange24h,
                holdings: Number(balance),
                value: Number(balance) * mockPrice,
                allocation: 0, // Will calculate after all data is fetched
                totalSupply: Number(totalSupply),
                decimals: token.decimals,
                logoUrl: token.logo_url?.[0] || null,
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching token ${tokenId}:`, err);
            return null;
          }
        })
      );
      
      const validPortfolio = portfolioData.filter(token => token !== null);
      
      // Calculate allocations
      const totalValue = validPortfolio.reduce((sum, token) => sum + token.value, 0);
      validPortfolio.forEach(token => {
        token.allocation = totalValue > 0 ? (token.value / totalValue) * 100 : 0;
      });
      
      setPortfolio(validPortfolio);
      
      // Fetch trending tokens (tokens user doesn't own)
      const ownedTokenIds = new Set(userTokens.map(([id]) => id.toString()));
      const trendingTokensData = await Promise.all(
        tokenIds
          .filter(id => !ownedTokenIds.has(id.toString()))
          .slice(0, 5) // Limit to top 5
          .map(async (tokenId) => {
            try {
              const tokenInfo = await actor.token_info(Number(tokenId));
              if (tokenInfo && tokenInfo.length > 0) {
                const token = tokenInfo[0];
                const mockPrice = 1 + (Number(tokenId) * 0.5);
                const mockChange24h = Math.random() * 50; // 0% to 50% for trending
                
                return {
                  id: tokenId.toString(),
                  name: token.name,
                  symbol: token.symbol,
                  creator: token.minting_account.toString().slice(0, 8) + "...",
                  creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${token.minting_account.toString()}`,
                  price: mockPrice,
                  change24h: mockChange24h,
                  volume24h: Math.floor(Math.random() * 200000) + 50000,
                  holders: Math.floor(Math.random() * 2000) + 100,
                };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching trending token ${tokenId}:`, err);
              return null;
            }
          })
      );
      
      setAllTokens(trendingTokensData.filter(token => token !== null));
      
      // Fetch user profile
      try {
        const profile = await actor.get_user_profile(userPrincipal);
        if (profile && profile.length > 0) {
          setUserProfile(profile[0]);
        }
      } catch (profileErr) {
        console.warn("Could not fetch user profile:", profileErr);
        // Don't fail the whole operation if profile fetch fails
      }
      
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      
      // Provide more specific error messages
      let errorMessage = "Failed to load portfolio data";
      if (err.message?.includes("Invalid principal")) {
        errorMessage = "Invalid user principal. Please reconnect with Internet Identity.";
      } else if (err.message?.includes("Call failed")) {
        errorMessage = "Backend call failed. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (isConnectedToBackend && user?.principal) {
      fetchPortfolioData();
    } else {
      setLoading(false);
      if (!isConnectedToBackend) {
        setError("Please connect to backend to view your portfolio");
      } else if (!user?.principal) {
        setError("No user principal available. Please log in again.");
      }
    }
  }, [actor, user?.principal, isConnectedToBackend]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolioData();
  };

  // Handle token transfer
  const handleTokenAction = async (tokenId, action, amount = 1) => {
    if (!actor || !user?.principal) {
      setError("Backend connection required");
      return;
    }

    const userPrincipal = formatPrincipal(user.principal);
    if (!userPrincipal) {
      setError("Invalid user principal");
      return;
    }

    try {
      setError(null);
      
      if (action === 'buy') {
        // For demo purposes, we'll mint tokens to the user
        // In a real marketplace, this would involve a different mechanism
        console.log(`Buying ${amount} of token ${tokenId}`);
        // This would typically involve a marketplace contract
      } else if (action === 'sell') {
        // For demo purposes, we'll transfer to a burn address or marketplace
        console.log(`Selling ${amount} of token ${tokenId}`);
        // This would typically involve transferring to marketplace
      }
      
      // Refresh portfolio after action
      await fetchPortfolioData();
    } catch (err) {
      console.error(`Error with ${action} action:`, err);
      setError(`Failed to ${action} tokens: ${err.message}`);
    }
  };

  // Debug info component
  const DebugInfo = () => (
    <div className="mb-4 p-3 bg-muted rounded-lg text-xs font-mono">
      <div>User Principal: {user?.principal || 'Not available'}</div>
      <div>Valid Principal: {user?.principal ? isValidPrincipal(user.principal) ? 'Yes' : 'No' : 'N/A'}</div>
      <div>Backend Connected: {isConnectedToBackend ? 'Yes' : 'No'}</div>
      <div>Actor Available: {actor ? 'Yes' : 'No'}</div>
    </div>
  );

  // Mock recent trades - in real app, this would come from backend transaction history
  const recentTrades = [
    {
      id: '1',
      type: 'buy',
      token: portfolio[0]?.symbol || 'TOKEN',
      amount: 50,
      price: portfolio[0]?.price || 1.0,
      timestamp: '2 hours ago',
      value: 50 * (portfolio[0]?.price || 1.0)
    },
    {
      id: '2',
      type: 'sell',
      token: portfolio[1]?.symbol || 'TOKEN2',
      amount: 25,
      price: portfolio[1]?.price || 1.0,
      timestamp: '1 day ago',
      value: 25 * (portfolio[1]?.price || 1.0)
    }
  ];

  const totalValue = portfolio.reduce((sum, token) => sum + token.value, 0);
  const totalGainLoss = portfolio.reduce((sum, token) => sum + (token.value * token.change24h / 100), 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / totalValue) * 100 : 0;

  const bestPerformer = portfolio.reduce((best, token) => 
    (!best || token.change24h > best.change24h) ? token : best, null);

  if (!isConnectedToBackend) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect to the backend to access your dashboard. Use the demo mode or connect with Internet Identity.
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
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugInfo />}
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Portfolio</h1>
            <p className="text-muted-foreground">
              Track your creator token investments and discover new opportunities.
            </p>
            {userProfile && (
              <p className="text-sm text-muted-foreground mt-1">
                Tokens created: {Number(userProfile.tokensCreated)} • 
                Role: {userProfile.role.Admin ? 'Admin' : userProfile.role.Creator ? 'Creator' : 'User'}
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tokens..." className="pl-10 w-64" />
            </div>
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
            <AlertDescription>
              {error}
              {error.includes("Invalid principal") && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Reconnect
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

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
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
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
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tokens Owned</CardTitle>
                  <Star className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{portfolio.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Across {portfolio.length} different creators
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : bestPerformer ? (
                    <>
                      <div className="text-2xl font-bold text-success">{bestPerformer.symbol}</div>
                      <p className="text-xs text-muted-foreground">
                        +{bestPerformer.change24h.toFixed(1)}% in 24h
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-muted-foreground">No tokens yet</p>
                    </>
                  )}
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
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
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
                    ) : portfolio.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-medium">No tokens yet</h3>
                        <p className="text-muted-foreground">Start investing in creator tokens to build your portfolio.</p>
                        <Button 
                          className="mt-4" 
                          onClick={() => setSelectedTab('watchlist')}
                        >
                          Explore Tokens
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {portfolio.map((token) => (
                          <div key={token.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={token.logoUrl || token.creatorAvatar} />
                                <AvatarFallback>{token.symbol}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{token.name}</h3>
                                <p className="text-sm text-muted-foreground">by {token.creator}</p>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold">{token.holdings.toLocaleString()}</div>
                              <p className="text-sm text-muted-foreground">{token.symbol}</p>
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
                                ${token.value.toFixed(2)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-success hover:text-success"
                                onClick={() => handleTokenAction(token.id, 'buy', 10)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleTokenAction(token.id, 'sell', 10)}
                                disabled={token.holdings <= 0}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    ) : (
                      <div className="space-y-4">
                        {allTokens.map((token) => (
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
                              <p className="font-medium">${token.price.toFixed(2)}</p>
                              <Badge 
                                variant="default"
                                className="bg-success text-success-foreground text-xs"
                              >
                                +{token.change24h.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                                {trade.amount} @ ${trade.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${trade.value.toFixed(2)}</p>
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
                <p className="text-muted-foreground">
                  Trade history interface will show all your token transactions once implemented.
                  This will include transfers, mints, and marketplace activities.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Discover Tokens</CardTitle>
                <CardDescription>Explore available creator tokens</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-full" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allTokens.map((token) => (
                      <Card key={token.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar>
                            <AvatarImage src={token.creatorAvatar} />
                            <AvatarFallback>{token.symbol}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{token.name}</h3>
                            <p className="text-sm text-muted-foreground">{token.creator}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold">${token.price.toFixed(2)}</span>
                          <Badge className="bg-success text-success-foreground">
                            +{token.change24h.toFixed(1)}%
                          </Badge>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => handleTokenAction(token.id, 'buy', 100)}
                        >
                          Buy {token.symbol}
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TokenCreationForm 
        open={isTokenFormOpen}
        onOpenChange={setIsTokenFormOpen}
      />
    </div>
  );
};

export default UserDashboard;