import React, { useState } from "react";
// import { Token } from "@/entities/Token";
import  User  from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  AlertCircle, 
  CheckCircle2,
  Coins,
  TrendingUp,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import TokenPreview from "../create/TokenPreview";
import CurveSelector from "../create/CurveSelector";
import FeeBreakdown from "../create/FeeBreakdown";

export default function CreateToken() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    description: "",
    total_supply: 1000000,
    current_price: 0.001,
    category: "",
    curve_type: "bonding",
    royalty_percentage: 5,
    platform_fee: 2.5
  });

  const handleInputChange = (field, value) => {
    setTokenData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCreationFee = () => {
    return 0.1; // Base creation fee in ICP
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      // Get current user
      const user = await User.me();
      
      // Create token
      const newToken = await Token.create({
        ...tokenData,
        creator_id: user.id,
        creator_name: user.full_name || user.email,
        creator_avatar: user.avatar_url || "",
        market_cap: tokenData.total_supply * tokenData.current_price,
        volume_24h: 0,
        price_change_24h: 0,
        holders_count: 1,
        is_active: true
      });

      setSuccess(true);
      
      // Redirect to token page after a delay
      setTimeout(() => {
        navigate(createPageUrl(`Token?id=${newToken.id}`));
      }, 2000);

    } catch (err) {
      setError("Failed to create token. Please try again.");
      console.error("Error creating token:", err);
    }
    
    setIsCreating(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-gray-900/50 backdrop-blur border-gray-800 text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Token Created!</h2>
            <p className="text-gray-400 mb-4">
              Your token has been successfully launched on the Internet Computer.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your token page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Token</h1>
          <p className="text-gray-400">Launch your creator token on the Internet Computer</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500/30 bg-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <Card className="bg-gray-900/50 backdrop-blur border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-blue-400" />
                    Token Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Token Name</Label>
                      <Input
                        id="name"
                        value={tokenData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="My Creator Token"
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="symbol" className="text-white">Symbol</Label>
                      <Input
                        id="symbol"
                        value={tokenData.symbol}
                        onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                        placeholder="MCT"
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={tokenData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your token's utility and value proposition..."
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 h-24"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="text-white">Category</Label>
                    <Select 
                      value={tokenData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Token Economics */}
              <Card className="bg-gray-900/50 backdrop-blur border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Token Economics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="total_supply" className="text-white">Total Supply</Label>
                      <Input
                        id="total_supply"
                        type="number"
                        value={tokenData.total_supply}
                        onChange={(e) => handleInputChange('total_supply', parseInt(e.target.value))}
                        className="bg-gray-800/50 border-gray-700 text-white"
                        min="1000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="current_price" className="text-white">Initial Price (ICP)</Label>
                      <Input
                        id="current_price"
                        type="number"
                        step="0.0001"
                        value={tokenData.current_price}
                        onChange={(e) => handleInputChange('current_price', parseFloat(e.target.value))}
                        className="bg-gray-800/50 border-gray-700 text-white"
                        min="0.0001"
                        required
                      />
                    </div>
                  </div>
                  
                  <CurveSelector 
                    value={tokenData.curve_type}
                    onChange={(value) => handleInputChange('curve_type', value)}
                  />
                </CardContent>
              </Card>

              {/* Fees */}
              <Card className="bg-gray-900/50 backdrop-blur border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-400" />
                    Fee Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="royalty_percentage" className="text-white">Creator Royalty (%)</Label>
                    <Input
                      id="royalty_percentage"
                      type="number"
                      step="0.1"
                      value={tokenData.royalty_percentage}
                      onChange={(e) => handleInputChange('royalty_percentage', parseFloat(e.target.value))}
                      className="bg-gray-800/50 border-gray-700 text-white"
                      min="0"
                      max="10"
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      Percentage of each trade you'll receive as the creator
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button 
                type="submit"
                disabled={isCreating || !tokenData.name || !tokenData.symbol || !tokenData.category}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
              >
                {isCreating ? (
                  <>Creating Token...</>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Create Token ({calculateCreationFee()} ICP)
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Preview & Fees */}
          <div className="space-y-6">
            <TokenPreview tokenData={tokenData} />
            <FeeBreakdown creationFee={calculateCreationFee()} tokenData={tokenData} />
          </div>
        </div>
      </div>
    </div>
  );
}