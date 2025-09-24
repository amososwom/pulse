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
  const [isConnectingActor, setIsConnectingActor] = useState(false);
  const { toast } = useToast();
  const { user, updateActor, isConnectedToBackend, principal } = useAuth();
  const { canCreateTokens } = usePermissions();

  // Get or create actor
  const [actor, setActor] = useState(user?.actor || null);

  // IDL Factory - make sure this matches your backend
  const idlFactory = ({ IDL }) => {
    const TokenId = IDL.Nat;
    const Tokens = IDL.Nat;
    const Account = IDL.Principal;
    
    const CreateTokenError = IDL.Variant({
      'InvalidName': IDL.Null,
      'InvalidSymbol': IDL.Null,
      'InvalidSupply': IDL.Null,
      'AnonymousNotAllowed': IDL.Null,
      'InsufficientPermissions': IDL.Null,
      'RateLimitExceeded': IDL.Null,
      'InternalError': IDL.Text,
    });

    const CreateTokenResult = IDL.Variant({
      'ok': TokenId,
      'err': CreateTokenError,
    });

    return IDL.Service({
      'create_token': IDL.Func(
        [IDL.Text, IDL.Text, Tokens, IDL.Nat8, IDL.Opt(IDL.Text)],
        [CreateTokenResult],
        [],
      ),
      'whoami': IDL.Func([], [IDL.Principal], ['query']),
      'token_info': IDL.Func([TokenId], [IDL.Opt(IDL.Record({
        'name': IDL.Text,
        'symbol': IDL.Text,
        'decimals': IDL.Nat8,
        'total_supply': Tokens,
        'minting_account': Account,
        'logo_url': IDL.Opt(IDL.Text),
      }))], ['query']),
    });
  };

  // Environment config
  const getConfig = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const network = process.env.DFX_NETWORK || (isDevelopment ? 'local' : 'ic');
    
    return {
      network,
      host: network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943',
      backendCanisterId: network === 'ic'
        ? process.env.REACT_APP_PULSE_BACKEND_CANISTER_ID
        : 'uxrrr-q7777-77774-qaaaq-cai',
    };
  };

  // Function to recreate actor when needed
  const recreateActor = async () => {
    if (!user || actor) return; // Don't recreate if we already have one

    setIsConnectingActor(true);
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      
      if (identity.getPrincipal().isAnonymous()) {
        console.warn('Cannot recreate actor with anonymous identity');
        setIsConnectingActor(false);
        return;
      }

      const config = getConfig();
      const agent = new HttpAgent({
        identity,
        host: config.host
      });

      if (config.network !== 'ic') {
        await agent.fetchRootKey();
      }

      const newActor = Actor.createActor(idlFactory, {
        agent,
        canisterId: config.backendCanisterId,
      });

      // Test the connection
      await newActor.whoami();
      
      setActor(newActor);
      updateActor(newActor);
      console.log('Actor recreated successfully');
      
    } catch (error) {
      console.error('Failed to recreate actor:', error);
    } finally {
      setIsConnectingActor(false);
    }
  };

  // Try to recreate actor when component mounts or user changes
  useEffect(() => {
    if (user && !actor && user.isConnectedToBackend) {
      recreateActor();
    }
  }, [user, actor]);

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

    // Try to recreate actor if needed
    let currentActor = actor;
    if (!currentActor && user.isConnectedToBackend) {
      toast({
        title: "Reconnecting to Backend",
        description: "Establishing connection...",
      });
      await recreateActor();
      currentActor = actor;
    }

    if (!currentActor) {
      toast({
        title: "Backend Connection Required",
        description: "Please refresh the page and sign in again to connect to the backend.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log("Creating token with values:", values);
      console.log("User principal:", principal);

      // Prepare token parameters with proper type conversion
      const tokenName = values.name.trim();
      const tokenSymbol = values.symbol.trim();
      
      // Ensure we're within JavaScript's safe integer range for Motoko Nat
      const supply = Math.min(values.totalSupply || 1000000, Number.MAX_SAFE_INTEGER);
      const initialSupply = Math.floor(supply); // Ensure it's an integer
      const decimals = 8; // Standard decimal places
      
      // Handle optional logoUrl properly for Candid interface
      const logoUrl = (values.logoUrl && values.logoUrl.trim() !== "") ? values.logoUrl.trim() : null;
      let optionalLogoUrl;
      if (logoUrl) {
        optionalLogoUrl = [logoUrl];
      } else {
        optionalLogoUrl = [];
      }

      console.log("Calling create_token with parameters:", {
        tokenName,
        tokenSymbol,
        initialSupply,
        decimals,
        logoUrl: optionalLogoUrl.length > 0 ? optionalLogoUrl[0] : "null"
      });

      // Call backend to create token with proper optional type handling
      const result = await currentActor.create_token(
        tokenName,         // name: Text
        tokenSymbol,       // symbol: Text  
        initialSupply,     // initial_supply: Tokens (Nat)
        decimals,          // decimals: Nat8
        optionalLogoUrl    // logo_url: ?Text ([] for None, [value] for Some)
      );

      console.log("Backend response:", result);

      // Handle the Result type from backend
      if (result.ok !== undefined) {
        // Success case
        const tokenId = result.ok;
        console.log("Token created with ID:", tokenId.toString());

        // Try to get token info to confirm creation
        try {
          const tokenInfo = await currentActor.token_info(tokenId);
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
        // Error case - handle all possible error variants
        const error = result.err;
        let errorMessage = "Unknown error occurred";
        
        // Check each possible error variant
        if (error.InvalidName !== undefined) {
          errorMessage = "Invalid token name (must be 2-50 characters)";
        } else if (error.InvalidSymbol !== undefined) {
          errorMessage = "Invalid token symbol (must be 2-10 characters)";
        } else if (error.InvalidSupply !== undefined) {
          errorMessage = "Invalid token supply (must be greater than 0)";
        } else if (error.AnonymousNotAllowed !== undefined) {
          errorMessage = "Anonymous users cannot create tokens";
        } else if (error.InsufficientPermissions !== undefined) {
          errorMessage = "You don't have permission to create tokens";
        } else if (error.RateLimitExceeded !== undefined) {
          errorMessage = "Rate limit exceeded, please try again later";
        } else if (error.InternalError !== undefined) {
          errorMessage = `Internal error: ${error.InternalError}`;
        }

        console.error("Token creation error:", error);
        throw new Error(errorMessage);
        
      } else {
        console.error("Unexpected response format:", result);
        throw new Error("Unexpected response format from backend");
      }

    } catch (error) {
      console.error("Error creating token:", error);
      
      toast({
        title: "Error Creating Token",
        description: error.message || "Failed to create token. Please check your inputs and try again.",
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

    if (isConnectingActor) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Connecting to backend...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!actor) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-sm">Backend connection unavailable</div>
                <button 
                  onClick={recreateActor}
                  className="text-xs text-yellow-700 underline mt-1"
                >
                  Try reconnecting
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      // Your existing success AuthStatus component
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
                <h3 className="font-semibold text-emerald-800">Backend Connected</h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Ready to create tokens on the Internet Computer.
              </p>
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