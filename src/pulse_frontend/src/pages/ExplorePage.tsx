import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  TrendingUp,
  Star,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";

const ExplorePage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [category, setCategory] = useState("all");
  
  // Mock data for tokens
  const [tokens] = useState([
    {
      id: '1',
      name: 'CreatorCoin',
      symbol: 'CC',
      creator: 'TechGuru',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techguru',
      price: 2.45,
      change24h: 12.5,
      volume24h: 25678.90,
      marketCap: 2450000,
      holders: 1234,
      category: 'Tech',
      description: 'The ultimate token for tech enthusiasts and developers.',
      isVerified: true,
    },
    {
      id: '2',
      name: 'ArtToken',
      symbol: 'ART',
      creator: 'DigitalArtist',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
      price: 1.87,
      change24h: -3.2,
      volume24h: 18500.45,
      marketCap: 1870000,
      holders: 892,
      category: 'Art',
      description: 'Supporting digital artists and creative communities.',
      isVerified: true,
    },
    {
      id: '3',
      name: 'MusicCoin',
      symbol: 'MUSIC',
      creator: 'Musician',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musician',
      price: 3.22,
      change24h: 45.6,
      volume24h: 125000,
      marketCap: 3220000,
      holders: 2156,
      category: 'Music',
      description: 'Revolutionizing music streaming and artist monetization.',
      isVerified: false,
    },
    {
      id: '4',
      name: 'GameToken',
      symbol: 'GAME',
      creator: 'GameDev',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamedev',
      price: 0.35,
      change24h: 8.7,
      volume24h: 45600,
      marketCap: 350000,
      holders: 567,
      category: 'Gaming',
      description: 'Gaming ecosystem token for indie developers.',
      isVerified: false,
    },
    {
      id: '5',
      name: 'FitnessCoin',
      symbol: 'FIT',
      creator: 'FitnessInfluencer',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitness',
      price: 1.15,
      change24h: 22.3,
      volume24h: 78900,
      marketCap: 1150000,
      holders: 1456,
      category: 'Health',
      description: 'Motivating fitness communities and healthy lifestyles.',
      isVerified: true,
    },
    {
      id: '6',
      name: 'FoodieToken',
      symbol: 'FOOD',
      creator: 'ChefMaster',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef',
      price: 0.95,
      change24h: 15.8,
      volume24h: 34500,
      marketCap: 950000,
      holders: 723,
      category: 'Food',
      description: 'Connecting food lovers and culinary experiences.',
      isVerified: false,
    }
  ]);

  const [trendingCreators] = useState([
    {
      id: '1',
      name: 'TechGuru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techguru',
      followers: 125000,
      tokensCreated: 3,
      totalValue: 4500000,
      category: 'Tech',
    },
    {
      id: '2',
      name: 'DigitalArtist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
      followers: 89000,
      tokensCreated: 2,
      totalValue: 2340000,
      category: 'Art',
    },
    {
      id: '3',
      name: 'Musician',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musician',
      followers: 234000,
      tokensCreated: 1,
      totalValue: 3220000,
      category: 'Music',
    }
  ]);

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || token.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    switch (sortBy) {
      case 'price_high':
        return b.price - a.price;
      case 'price_low':
        return a.price - b.price;
      case 'volume':
        return b.volume24h - a.volume24h;
      case 'change':
        return b.change24h - a.change24h;
      case 'trending':
      default:
        return b.volume24h - a.volume24h;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Creator Tokens</h1>
          <p className="text-muted-foreground">
            Discover and invest in creator tokens from your favorite influencers and artists.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="pulse-card-gradient pulse-shadow border-border mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tokens, creators, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="change">24h Change</SelectItem>
                  <SelectItem value="price_high">Price (High to Low)</SelectItem>
                  <SelectItem value="price_low">Price (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Token List */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTokens.map((token) => (
                <Card key={token.id} className="pulse-card-gradient pulse-shadow border-border hover:pulse-glow pulse-transition cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={token.creatorAvatar} />
                          <AvatarFallback>{token.symbol}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{token.name}</h3>
                            {token.isVerified && (
                              <Badge variant="secondary" className="bg-success/20 text-success text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">by {token.creator}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{token.category}</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {token.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">${token.price}</span>
                          <Badge 
                            variant={token.change24h > 0 ? "default" : "destructive"}
                            className={token.change24h > 0 ? "bg-success text-success-foreground" : ""}
                          >
                            {token.change24h > 0 ? '+' : ''}{token.change24h}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Holders</p>
                        <p className="font-semibold">{token.holders.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-sm">
                        <p className="text-muted-foreground">24h Volume</p>
                        <p className="font-semibold">${token.volume24h.toLocaleString()}</p>
                      </div>
                      
                      <Button className="pulse-gradient hover:opacity-90 pulse-transition" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Buy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Creators */}
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-warning" />
                  <span>Trending Creators</span>
                </CardTitle>
                <CardDescription>Most active creators this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingCreators.map((creator, index) => (
                    <div key={creator.id} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        #{index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={creator.avatar} />
                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{creator.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {creator.followers.toLocaleString()} followers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${(creator.totalValue / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {creator.tokensCreated} token{creator.tokensCreated > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <Card className="pulse-card-gradient pulse-shadow border-border">
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Tokens</span>
                  <span className="font-semibold">{tokens.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Volume (24h)</span>
                  <span className="font-semibold">
                    ${tokens.reduce((sum, token) => sum + token.volume24h, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Traders</span>
                  <span className="font-semibold">
                    {tokens.reduce((sum, token) => sum + token.holders, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. 24h Change</span>
                  <span className="font-semibold text-success">
                    +{(tokens.reduce((sum, token) => sum + token.change24h, 0) / tokens.length).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {user?.type === 'creator' && (
              <Card className="pulse-card-gradient pulse-shadow border-border">
                <CardHeader>
                  <CardTitle>Creator Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full pulse-gradient hover:opacity-90 pulse-transition">
                    <Link to="/creator/create-token">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Token
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/creator">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;