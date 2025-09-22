import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Users, TrendingUp, ArrowRight, Coins, DollarSign } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pulse-gradient opacity-10" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 pulse-gradient rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold">Pulse</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The first fully on-chain creator economy platform built on Internet Computer Protocol.
            Launch tokens, monetize communities, and enable seamless trading.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="pulse-gradient hover:opacity-90 pulse-transition">
              <Link to="/login">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/explore">
                Explore Tokens
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12.5K+</div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">567</div>
              <p className="text-muted-foreground">Creator Tokens</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">$2.5M+</div>
              <p className="text-muted-foreground">Trading Volume</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Pulse?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built on Internet Computer Protocol for maximum security, scalability, and decentralization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="pulse-card-gradient pulse-shadow border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Internet Identity</CardTitle>
              <CardDescription>
                Secure, passwordless authentication powered by ICP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No passwords, no compromised accounts. Login securely with your device's biometrics.
              </p>
            </CardContent>
          </Card>

          <Card className="pulse-card-gradient pulse-shadow border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-success" />
              </div>
              <CardTitle>Token Creation</CardTitle>
              <CardDescription>
                Launch your creator token in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose from bonding curves, fixed supply, or AMM models to perfectly fit your community.
              </p>
            </CardContent>
          </Card>

          <Card className="pulse-card-gradient pulse-shadow border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <CardTitle>Revenue Streams</CardTitle>
              <CardDescription>
                Multiple ways to monetize your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn from minting fees, trading commissions, and exclusive content access.
              </p>
            </CardContent>
          </Card>

          <Card className="pulse-card-gradient pulse-shadow border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Community First</CardTitle>
              <CardDescription>
                Build engaged, invested communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Token holders become true stakeholders in your success with aligned incentives.
              </p>
            </CardContent>
          </Card>

          <Card className="pulse-card-gradient pulse-shadow border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Chain Fusion</CardTitle>
              <CardDescription>
                Accept BTC, ETH, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cross-chain payments made simple with ICP's Chain Fusion technology.
              </p>
            </CardContent>
          </Card>

          <Card className="pulse-card-gradient pulse-shadow border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-foreground" />
              </div>
              <CardTitle>Reverse Gas</CardTitle>
              <CardDescription>
                Fans trade without gas fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Creators fund the cycles, fans enjoy seamless, gasless trading experiences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pulse-gradient opacity-10" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Token?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the creator economy revolution. Launch your token, build your community, and start earning today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="pulse-gradient hover:opacity-90 pulse-transition">
              <Link to="/login">
                <Shield className="w-4 h-4 mr-2" />
                Start with Internet Identity
              </Link>
            </Button>
          </div>
          
          <div className="mt-8">
            <Badge variant="secondary" className="text-xs">
              Powered by Internet Computer Protocol
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
