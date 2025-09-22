import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Update selected tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/users')) setSelectedTab('users');
    else if (path.includes('/tokens')) setSelectedTab('tokens');
    else if (path.includes('/revenue')) setSelectedTab('revenue');
    else if (path.includes('/system')) setSelectedTab('system');
    else setSelectedTab('overview');
  }, [location.pathname]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (value === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${value}`);
    }
  };
  
  // Mock data - in real app, this would come from ICP canisters
  const [platformStats] = useState({
    totalUsers: 12543,
    totalCreators: 1234,
    totalTokens: 567,
    totalVolume: 2543678.90,
    totalFees: 127834.45,
    activeTokens: 432,
    pendingReviews: 23,
    flaggedContent: 5,
  });

  const [recentTokens] = useState([
    {
      id: '1',
      name: 'CreatorCoin',
      symbol: 'CC',
      creator: 'TechGuru',
      creatorId: 'user123',
      status: 'active',
      created: '2024-01-15',
      holders: 1234,
      volume24h: 25678.90,
      fees: 1283.95,
    },
    {
      id: '2',
      name: 'ArtToken',
      symbol: 'ART',
      creator: 'DigitalArtist',
      creatorId: 'user456',
      status: 'pending',
      created: '2024-01-14',
      holders: 89,
      volume24h: 5432.10,
      fees: 271.61,
    },
    {
      id: '3',
      name: 'MusicCoin',
      symbol: 'MUSIC',
      creator: 'Musician',
      creatorId: 'user789',
      status: 'flagged',
      created: '2024-01-13',
      holders: 567,
      volume24h: 12345.67,
      fees: 617.28,
    },
  ]);

  const [topUsers] = useState([
    {
      id: 'user1',
      name: 'SuperTrader',
      type: 'user',
      totalValue: 125000,
      tokensOwned: 45,
      joinDate: '2023-12-01',
      status: 'verified',
    },
    {
      id: 'user2',
      name: 'MegaCreator',
      type: 'creator',
      totalValue: 89000,
      tokensOwned: 3,
      joinDate: '2023-11-15',
      status: 'verified',
    },
    {
      id: 'user3',
      name: 'CryptoFan',
      type: 'user',
      totalValue: 67000,
      tokensOwned: 23,
      joinDate: '2024-01-05',
      status: 'active',
    },
  ]);

  const getStatusColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and management controls for Pulse.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button className="pulse-gradient hover:opacity-90 pulse-transition">
              <Settings className="w-4 h-4 mr-2" />
              Platform Settings
            </Button>
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
                  <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 inline mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                  <Coins className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.totalTokens}</div>
                  <p className="text-xs text-muted-foreground">
                    {platformStats.activeTokens} active
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${platformStats.totalVolume.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 inline mr-1" />
                    +8.4% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${platformStats.totalFees.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total collected
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="pulse-card-gradient pulse-shadow border-warning">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{platformStats.pendingReviews}</div>
                  <p className="text-xs text-muted-foreground">
                    Tokens awaiting approval
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-destructive">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{platformStats.flaggedContent}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card className="pulse-card-gradient pulse-shadow border-success">
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
                        <CardTitle>Recent Tokens</CardTitle>
                        <CardDescription>Latest token submissions and activity</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Creator</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Volume</TableHead>
                          <TableHead>Fees</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`} />
                                  <AvatarFallback>{token.symbol}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{token.name}</p>
                                  <p className="text-sm text-muted-foreground">{token.symbol}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{token.creator}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(token.status)}>
                                {token.status}
                              </Badge>
                            </TableCell>
                            <TableCell>${token.volume24h.toLocaleString()}</TableCell>
                            <TableCell>${token.fees}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {token.status === 'flagged' && (
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Top Users */}
              <div>
                <Card className="pulse-card-gradient pulse-shadow border-border">
                  <CardHeader>
                    <CardTitle>Top Users</CardTitle>
                    <CardDescription>Highest value participants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topUsers.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-sm font-bold">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">{user.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${user.totalValue.toLocaleString()}</p>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6">
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Token Management</CardTitle>
                <CardDescription>Review and manage creator tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Token management interface coming soon...</p>
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
                <p className="text-muted-foreground">Revenue analytics coming soon...</p>
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
                <p className="text-muted-foreground">System settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;