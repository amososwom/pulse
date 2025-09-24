import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Users,
  Coins,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Settings,
  ArrowUpRight,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "../components/Navigation";
import CyberpunkTokenButton from "@/components/CyberpunkTokenButton";
import TokenCreationForm from "@/components/TokenCreationForm";

const AdminDashboard = () => {
  const { user, actor } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);

  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Backend data states
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalTokens: 0,
    adminCount: 0,
    creatorCount: 0,
  });

  const [allTokens, setAllTokens] = useState([]);
  const [tokenDetails, setTokenDetails] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/users')) setSelectedTab('users');
    else if (path.includes('/tokens')) setSelectedTab('tokens');
    else if (path.includes('/revenue')) setSelectedTab('revenue');
    else if (path.includes('/system')) setSelectedTab('system');
    else setSelectedTab('overview');
  }, [location.pathname]);

  const handleTabChange = (value) => {
    setSelectedTab(value);
    if (value === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${value}`);
    }
  };

  // Fetch platform statistics
  const fetchPlatformStats = async () => {
    if (!actor) return;
    
    setIsLoadingStats(true);
    try {
      const stats = await actor.get_stats();
      console.log('Platform stats:', stats);
      
      setPlatformStats({
        totalUsers: Number(stats.total_users),
        totalTokens: Number(stats.total_tokens),
        adminCount: Number(stats.admin_count),
        creatorCount: Number(stats.creator_count),
        totalCreators: Number(stats.creator_count),
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      toast({
        title: "Error",
        description: "Failed to load platform statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch all tokens
  const fetchAllTokens = async () => {
    if (!actor) return;
    
    setIsLoadingTokens(true);
    try {
      // Get list of all token IDs
      const tokenIds = await actor.all_tokens();
      console.log('All token IDs:', tokenIds);
      
      setAllTokens(tokenIds.map(id => Number(id)));

      // Fetch detailed info for each token
      const tokenDetailPromises = tokenIds.map(async (tokenId) => {
        try {
          const info = await actor.token_info(Number(tokenId));
          if (info && info.length > 0) {
            const tokenData = info[0];
            // Get total supply
            const totalSupply = await actor.total_supply(Number(tokenId));
            
            return {
              id: Number(tokenId),
              name: tokenData.name,
              symbol: tokenData.symbol,
              decimals: tokenData.decimals,
              totalSupply: Number(totalSupply),
              creator: tokenData.minting_account.toString(),
              logoUrl: tokenData.logo_url.length > 0 ? tokenData.logo_url[0] : null,
              status: 'active', // Default status
              created: new Date().toISOString().split('T')[0], // Placeholder
              holders: 1, // Would need additional tracking
              volume24h: 0, // Would need trading data
              fees: 0, // Would need fee tracking
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching token ${tokenId}:`, error);
          return null;
        }
      });

      const details = await Promise.all(tokenDetailPromises);
      const validDetails = details.filter(detail => detail !== null);
      setTokenDetails(validDetails);
      console.log('Token details:', validDetails);
      
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "Error", 
        description: "Failed to load tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Fetch all users (admin only)
  const fetchAllUsers = async () => {
    if (!actor) return;
    
    setIsLoadingUsers(true);
    try {
      const users = await actor.get_all_users();
      console.log('All users:', users);
      
      if (users && users.length > 0) {
        const userList = users[0].map(userProfile => ({
          id: userProfile.principal.toString(),
          principal: userProfile.principal.toString(),
          name: `User ${userProfile.principal.toString().slice(0, 8)}...`,
          type: userProfile.role.Admin ? 'admin' : 
                userProfile.role.Creator ? 'creator' : 'user',
          role: userProfile.role,
          tokensCreated: Number(userProfile.tokensCreated),
          isVerified: userProfile.isVerified,
          createdAt: new Date(Number(userProfile.createdAt) / 1000000).toLocaleDateString(),
          lastActive: new Date(Number(userProfile.lastActive) / 1000000).toLocaleDateString(),
          status: userProfile.isVerified ? 'verified' : 'active',
        }));
        setAllUsers(userList);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users (admin access required)",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load all data on component mount and when actor changes
  useEffect(() => {
    if (actor && user) {
      fetchPlatformStats();
      fetchAllTokens();
      if (user.type === 'admin') {
        fetchAllUsers();
      }
    }
  }, [actor, user]);

  // Refresh all data
  const handleRefreshData = async () => {
    if (!actor) {
      toast({
        title: "No Connection",
        description: "Backend connection required to refresh data",
        variant: "destructive",
      });
      return;
    }

    await Promise.all([
      fetchPlatformStats(),
      fetchAllTokens(),
      user?.type === 'admin' ? fetchAllUsers() : Promise.resolve()
    ]);

    toast({
      title: "Success",
      description: "Data refreshed successfully",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'verified':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'flagged':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'creator':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Admin privileges required to access this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and management controls for Pulse.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isLoadingStats || isLoadingTokens || isLoadingUsers}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button className="pulse-gradient hover:opacity-90 pulse-transition">
              <Settings className="w-4 h-4 mr-2" />
              Platform Settings
            </Button>
            <CyberpunkTokenButton
              render={setIsTokenFormOpen}
            />
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        {platformStats.creatorCount} creators, {platformStats.adminCount} admins
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                  <Coins className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{platformStats.totalTokens}</div>
                      <p className="text-xs text-muted-foreground">
                        All active
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Coming Soon</div>
                  <p className="text-xs text-muted-foreground">
                    Trading volume tracking
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Coming Soon</div>
                  <p className="text-xs text-muted-foreground">
                    Fee collection tracking
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Backend Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">Connected</div>
                  <p className="text-xs text-muted-foreground">
                    {actor ? 'Backend connected' : 'Backend unavailable'}
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Token Creation</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">Active</div>
                  <p className="text-xs text-muted-foreground">
                    All users can create tokens
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">Healthy</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Tokens */}
              <div className="xl:col-span-2">
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Tokens</CardTitle>
                        <CardDescription>Tokens created on the platform</CardDescription>
                      </div>
                      <Badge variant="secondary">{tokenDetails.length} tokens</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTokens ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading tokens...</span>
                      </div>
                    ) : tokenDetails.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Token</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead>Supply</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tokenDetails.slice(0, 10).map((token) => (
                            <TableRow key={token.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage 
                                      src={token.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} 
                                    />
                                    <AvatarFallback>{token.symbol}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{token.name}</p>
                                    <p className="text-sm text-muted-foreground">{token.symbol}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs font-mono">
                                  {token.creator.slice(0, 8)}...{token.creator.slice(-6)}
                                </span>
                              </TableCell>
                              <TableCell>{token.totalSupply.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(token.status)}>
                                  {token.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No tokens found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top Users */}
              <div>
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Platform participants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading users...</span>
                      </div>
                    ) : allUsers.length > 0 ? (
                      <div className="space-y-4">
                        {allUsers.slice(0, 5).map((user, index) => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.principal}`} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <Badge className={getRoleColor(user.type)} variant="secondary">
                                  {user.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{user.tokensCreated} tokens</p>
                              <Badge className={getStatusColor(user.status)} variant="outline">
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage platform users and their permissions</CardDescription>
                  </div>
                  <Badge variant="secondary">{allUsers.length} users</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading users...</span>
                  </div>
                ) : allUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Tokens Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.principal}`} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {user.principal.slice(0, 12)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.type)}>
                              {user.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.tokensCreated}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.lastActive}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Token Management</CardTitle>
                    <CardDescription>Review and manage creator tokens</CardDescription>
                  </div>
                  <Badge variant="secondary">{tokenDetails.length} tokens</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTokens ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading tokens...</span>
                  </div>
                ) : tokenDetails.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokenDetails.map((token) => (
                      <Card key={token.id} className="border">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage 
                                src={token.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} 
                              />
                              <AvatarFallback>{token.symbol}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{token.name}</CardTitle>
                              <CardDescription>{token.symbol}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Token ID:</span>
                              <span>{token.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Supply:</span>
                              <span>{token.totalSupply.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Creator:</span>
                              <span className="font-mono text-xs">
                                {token.creator.slice(0, 8)}...
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Status:</span>
                              <Badge className={getStatusColor(token.status)}>
                                {token.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tokens found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Platform revenue and fee analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Revenue analytics will be available when trading features are implemented.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Platform configuration and system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Connection Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Backend Connection</span>
                        <Badge className={actor ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                          {actor ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>User Authentication</span>
                        <Badge className="bg-success text-success-foreground">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Token Creation</span>
                        <Badge className="bg-success text-success-foreground">
                          Enabled
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Platform Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Total Canisters</span>
                        <span>3</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Network</span>
                        <Badge variant="outline">Local Development</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Identity Provider</span>
                        <Badge variant="outline">Internet Identity</Badge>
                      </div>
                    </div>
                  </div>
                </div>
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

export default AdminDashboard;