import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  LayoutDashboard,
  Coins,
  TrendingUp,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  PlusCircle,
  Copy,
  CheckCircle,
  Globe,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { AuthClient } from "@dfinity/auth-client";
import TokenCreationForm from "./TokenCreationForm";

const Navigation = () => {
  const { user, logout, principal, isConnectedToBackend, isDemo } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications] = useState(3);
  const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Enhanced logout function that handles Internet Identity
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // If connected to backend (Internet Identity), logout from II first
      if (isConnectedToBackend && !isDemo) {
        try {
          const authClient = await AuthClient.create();
          await authClient.logout();
          console.log("Logged out from Internet Identity");
        } catch (iiError) {
          console.warn("Internet Identity logout failed:", iiError);
          // Continue with local logout even if II logout fails
        }
      }

      // Always perform local logout
      logout();

      toast({
        title: "Logged Out Successfully",
        description:
          isConnectedToBackend && !isDemo
            ? "You have been logged out from Internet Identity and Pulse"
            : "You have been logged out from Pulse",
        duration: 3000,
      });

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Copy principal to clipboard
  const handleCopyPrincipal = async () => {
    if (!principal) {
      toast({
        title: "No Principal",
        description: "No principal available to copy",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(principal);
      setIsCopied(true);
      toast({
        title: "Principal Copied",
        description:
          "Your Internet Identity principal has been copied to clipboard",
      });

      // Reset copy state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = principal;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setIsCopied(true);
        toast({
          title: "Principal Copied",
          description:
            "Your Internet Identity principal has been copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackError) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy to clipboard. Please copy manually.",
          variant: "destructive",
        });
      }
    }
  };

  const getNavigationItems = () => {
    if (user?.type === "creator") {
      return [
        { label: "Dashboard", path: "/creator", icon: LayoutDashboard },
        { label: "My Tokens", path: "/creator/tokens", icon: Coins },
        { label: "Analytics", path: "/creator/analytics", icon: TrendingUp },
      ];
    } else if (user?.type === "admin") {
      return [
        { label: "Overview", path: "/admin", icon: LayoutDashboard },
        { label: "Users", path: "/admin/users", icon: User },
        { label: "Tokens", path: "/admin/tokens", icon: Coins },
        { label: "Analytics", path: "/admin/analytics", icon: TrendingUp },
      ];
    } else {
      return [
        { label: "Dashboard", path: "/creator", icon: LayoutDashboard },
        { label: "Explore", path: "/explore", icon: Search },
        { label: "Portfolio", path: "/portfolio", icon: TrendingUp },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 pulse-gradient rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Pulse</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {user?.type === "admin"
                  ? "Admin"
                  : user?.type === "creator"
                  ? "Creator"
                  : "Beta"}
              </Badge>
              {/* Connection status indicator */}
              {isConnectedToBackend && !isDemo && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center space-x-1"
                >
                  <Shield className="w-3 h-3" />
                  <span>II</span>
                </Badge>
              )}
              {isDemo && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  Demo
                </Badge>
              )}
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg pulse-transition ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-sm mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens, creators..."
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Create Token Button for Creators */}
            {user?.type === "creator" && (
              <Button
                onClick={() => setIsTokenFormOpen(true)}
                className="pulse-gradient hover:opacity-90 pulse-transition"
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            )}
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>
                {isLoggingOut
                  ? "Logging out..."
                  : isConnectedToBackend && !isDemo
                  ? "Logout from II"
                  : "Log out"}
              </span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                {/* User Info Section */}
                <div className="flex flex-col space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <div className="flex items-center space-x-1">
                      {isConnectedToBackend && !isDemo && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          II.
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {user?.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Principal with Copy Button */}
                  {principal && (
                    <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          Internet Identity Principal
                        </p>
                        <p className="text-xs font-mono truncate">
                          {principal.slice(0, 12)}...{principal.slice(-8)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={handleCopyPrincipal}
                      >
                        {isCopied ? (
                          <CheckCircle className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Connection Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Backend:</span>
                    <span
                      className={
                        isConnectedToBackend
                          ? "text-success"
                          : "text-muted-foreground"
                      }
                    >
                      {isConnectedToBackend ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Menu Items */}
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Enhanced Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>
                    {isLoggingOut
                      ? "Logging out..."
                      : isConnectedToBackend && !isDemo
                      ? "Logout from II"
                      : "Log out"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <TokenCreationForm
        open={isTokenFormOpen}
        onOpenChange={setIsTokenFormOpen}
      />
    </nav>
  );
};

export default Navigation;
