import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth, usePermissions } from "@/hooks/useAuth";
import {
  Coins,
  TrendingUp,
  Lock,
  Zap,
  Info,
  DollarSign,
  Users,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const tokenFormSchema = z.object({
  name: z.string().min(2, "Token name must be at least 2 characters").max(50),
  symbol: z.string().min(2, "Symbol must be at least 2 characters").max(10).toUpperCase(),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  mode: z.enum(["curve", "fixed", "amm"]),
  totalSupply: z.number().min(1000, "Minimum supply is 1000 tokens").optional(),
  basePrice: z.number().min(0.001, "Base price must be at least 0.001 ICP"),
  curveType: z.enum(["linear", "exponential", "logarithmic"]).optional(),
  royaltyPercent: z.number().min(0).max(10, "Royalty cannot exceed 10%"),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    discord: z.string().url().optional().or(z.literal("")),
  }),
  enableNftIntegration: z.boolean(),
  seedLiquidity: z.number().min(0).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

const TokenCreationForm = ({ open, onOpenChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user, actor, isConnectedToBackend, principal } = useAuth();
  const { canCreateTokens } = usePermissions();

  const form = useForm({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      mode: "fixed",
      totalSupply: 1000000,
      basePrice: 0.01,
      curveType: "exponential",
      royaltyPercent: 2.5,
      socialLinks: {
        twitter: "",
        website: "",
        discord: "",
      },
      enableNftIntegration: false,
      seedLiquidity: 10,
      logoUrl: "",
    },
  });

  const watchedMode = form.watch("mode");
  const watchedBasePrice = form.watch("basePrice");
  const watchedSupply = form.watch("totalSupply");

  // Check authentication and permissions when dialog opens
  useEffect(() => {
    if (open && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Internet Identity to create tokens.",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  }, [open, user, toast, onOpenChange]);

  const onSubmit = async (values) => {
    // Pre-flight checks
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in with Internet Identity first.",
        variant: "destructive",
      });
      return;
    }

    if (!canCreateTokens) {
      toast({
        title: "Insufficient Permissions",
        description: "You don't have permission to create tokens.",
        variant: "destructive",
      });
      return;
    }

    if (!actor) {
      toast({
        title: "Backend Not Connected",
        description: "Unable to connect to the backend. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log("Creating token with values:", values);
      console.log("User principal:", principal);

      // Prepare token parameters with proper type conversion
      const tokenName = values.name;
      const tokenSymbol = values.symbol;
      // Ensure we're within JavaScript's safe integer range for Motoko Nat
      const supply = Math.min(values.totalSupply || 1000000, Number.MAX_SAFE_INTEGER);
      const initialSupply = Math.floor(supply); // Ensure it's an integer
      const decimals = 8; // Standard decimal places
      const logoUrl = values.logoUrl && values.logoUrl.trim() !== "" ? values.logoUrl : null;

      console.log("Calling create_token with:", {
        tokenName,
        tokenSymbol,
        initialSupply,
        decimals,
        logoUrl
      });

      // Call backend to create token
      const result = await actor.create_token(
        tokenName,                    // Text
        tokenSymbol,                  // Text  
        initialSupply,                // Nat (integer)
        decimals,                     // Nat8 (small integer)
        logoUrl ? [logoUrl] : []      // Opt Text (optional)
      );

      // Handle the Result type from backend
      if (result.ok !== undefined) {
        // Success case
        const tokenId = result.ok;
        console.log("Token created with ID:", tokenId.toString());

        // Get token info to confirm creation
        try {
          const tokenInfo = await actor.token_info(tokenId);
          console.log("Created token info:", tokenInfo);
        } catch (infoError) {
          console.warn("Token created but couldn't fetch info:", infoError);
        }

        toast({
          title: "Token Created Successfully!",
          description: `${values.name} (${values.symbol}) has been created with ID: ${tokenId.toString()}`,
          duration: 10000,
        });

        onOpenChange(false);
        form.reset();
      } else if (result.err !== undefined) {
        // Error case
        const error = result.err;
        let errorMessage = "Unknown error occurred";
        
        if (typeof error === 'object') {
          if (error.InvalidName) errorMessage = "Invalid token name provided";
          else if (error.InvalidSymbol) errorMessage = "Invalid token symbol provided";
          else if (error.InvalidSupply) errorMessage = "Invalid token supply provided";
          else if (error.AnonymousNotAllowed) errorMessage = "Anonymous users cannot create tokens";
          else if (error.InternalError) errorMessage = `Internal error: ${error.InternalError}`;
        }

        throw new Error(errorMessage);
      } else {
        throw new Error("Unexpected response format from backend");
      }
    } catch (error) {
      console.error("Error creating token:", error);
      toast({
        title: "Error Creating Token",
        description: error.message || "Failed to create token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const estimatedMarketCap =
    watchedBasePrice && watchedSupply
      ? (watchedBasePrice * watchedSupply).toLocaleString()
      : "0";

  // Authentication status component
  const AuthStatus = () => {
    if (!user) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Please sign in with Internet Identity</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!isConnectedToBackend) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Backend connection unavailable</span>
            </div>
          </CardContent>
        </Card>
      );
    }

  return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-transparent to-teal-100/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/30 to-transparent rounded-bl-full"></div>
        <CardContent className="relative pt-6 pb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-emerald-800">Secure Connection Active</h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Internet Identity verified and backend connection established. Your token creation is secured with end-to-end encryption.
              </p>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-1 text-xs text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Authenticated</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Backend Connected</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Ready to Deploy</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-6xl max-h-[90vh] overflow-y-auto pulse-card-gradient pulse-shadow">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Sparkles className="w-6 h-6 text-pulse-primary" />
            <span>Create Your Creator Token</span>
          </DialogTitle>
          <DialogDescription>
            Launch your own creator token on the Internet Computer.
            {principal && ` Creating as: ${principal.slice(0, 10)}...`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="pulse-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Coins className="w-5 h-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Creator Coin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symbol</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., CC"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your token and its utility..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Tell your community what makes your token special
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/logo.png"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            URL to your token's logo image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Token Economics */}
                <Card className="pulse-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Token Economics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Mode</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select token mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">
                                <div className="flex items-center space-x-2">
                                  <Lock className="w-4 h-4" />
                                  <span>Fixed Supply (Available)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="curve" disabled>
                                <div className="flex items-center space-x-2">
                                  <Zap className="w-4 h-4" />
                                  <span>Bonding Curve (Coming Soon)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="amm" disabled>
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>AMM Pool (Coming Soon)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Fixed supply tokens are ready for deployment
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="totalSupply"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Supply</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1000000"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Total number of tokens to create
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="royaltyPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Creator Fee (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                max="10"
                                placeholder="2.5"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Fee for future marketplace transactions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card className="pulse-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Social Presence</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="socialLinks.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://twitter.com/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialLinks.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialLinks.discord"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://discord.gg/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Sidebar */}
              <div className="space-y-6">
                <Card className="pulse-card-gradient pulse-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="w-5 h-5" />
                      <span>Token Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto pulse-gradient rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {form.watch("symbol") || "?"}
                        </span>
                      </div>
                      <h3 className="font-semibold">
                        {form.watch("name") || "Token Name"}
                      </h3>
                      <Badge variant="secondary">FIXED SUPPLY</Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Supply:
                        </span>
                        <span className="font-medium">
                          {(watchedSupply || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Creator Fee:
                        </span>
                        <span className="font-medium">
                          {form.watch("royaltyPercent") || 0}%
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Decimals:
                        </span>
                        <span className="font-medium">8</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Creator:
                        </span>
                        <span className="font-medium text-xs">
                          {principal ? `${principal.slice(0, 8)}...` : "Not connected"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="pulse-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>Creation Cost</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cycles Cost:</span>
                      <span>~0.01 ICP</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="text-pulse-primary">~0.01 ICP</span>
                    </div>
                  </CardContent>
                </Card>

                <AuthStatus />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="pulse-gradient hover:opacity-90 pulse-transition"
                disabled={isCreating || !user || !isConnectedToBackend || !canCreateTokens}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Token...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Token
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TokenCreationForm;