import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CreatorDashboard from "./pages/CreatorDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ExplorePage from "./pages/ExplorePage";
import NotFound from "./pages/NotFound";
import MainLanding from "./pages/MainLanding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Creator Dashboard Routes */}
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/creator/overview" element={<CreatorDashboard />} />
            <Route path="/creator/tokens" element={<CreatorDashboard />} />
            <Route path="/creator/analytics" element={<CreatorDashboard />} />
            <Route path="/creator/revenue" element={<CreatorDashboard />} />
            <Route path="/creator/community" element={<CreatorDashboard />} />
            
            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/dashboard/portfolio" element={<UserDashboard />} />
            <Route path="/dashboard/trades" element={<UserDashboard />} />
            <Route path="/dashboard/watchlist" element={<UserDashboard />} />
            <Route path="/portfolio" element={<UserDashboard />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/overview" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/tokens" element={<AdminDashboard />} />
            <Route path="/admin/revenue" element={<AdminDashboard />} />
            <Route path="/admin/system" element={<AdminDashboard />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/" element={<MainLanding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
