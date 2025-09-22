import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Coins,
  TrendingUp,
  Lock,
  Zap,
  Info,
  DollarSign,
  Users,
  Sparkles,
} from "lucide-react";

const tokenFormSchema = z.object({
  name: z.string().min(2, "Token name must be at least 2 characters").max(50),
  symbol: z.string().min(2, "Symbol must be at least 2 characters").max(10).toUpperCase(),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  mode: z.enum(["curve", "fixed", "amm"]),
  totalSupply: z.number().optional(),
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
});

const TokenCreationForm = ({ open, onOpenChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      mode: "curve",
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
    },
  });

  const watchedMode = form.watch("mode");
  const watchedBasePrice = form.watch("basePrice");
  const watchedSupply = form.watch("totalSupply");

  const onSubmit = async (values) => {
    setIsCreating(true);
    try {
      console.log("Creating token with values:", values);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: "Token Created Successfully!",
        description: `${values.name} (${values.symbol}) has been created and deployed to the Internet Computer.`,
        duration: 5000,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error Creating Token",
        description: "Failed to create token. Please try again.",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto pulse-card-gradient pulse-shadow">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Sparkles className="w-6 h-6 text-pulse-primary" />
            <span>Create Your Creator Token</span>
          </DialogTitle>
          <DialogDescription>
            Launch your own creator token on the Internet Computer. Choose between bonding curves for dynamic pricing or fixed supply tokens.
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
                              <SelectItem value="curve">
                                <div className="flex items-center space-x-2">
                                  <Zap className="w-4 h-4" />
                                  <span>Bonding Curve (Recommended)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="fixed">
                                <div className="flex items-center space-x-2">
                                  <Lock className="w-4 h-4" />
                                  <span>Fixed Supply</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="amm">
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>AMM Pool</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {watchedMode === "curve" &&
                              "Dynamic pricing based on supply and demand"}
                            {watchedMode === "fixed" &&
                              "Fixed total supply with manual distribution"}
                            {watchedMode === "amm" &&
                              "Automated market maker with liquidity pools"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {watchedMode === "fixed" && (
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {watchedMode === "curve"
                                ? "Starting Price"
                                : "Base Price"}{" "}
                              (ICP)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.001"
                                placeholder="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedMode === "curve" && (
                        <FormField
                          control={form.control}
                          name="curveType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Curve Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="linear">Linear</SelectItem>
                                  <SelectItem value="exponential">
                                    Exponential (Recommended)
                                  </SelectItem>
                                  <SelectItem value="logarithmic">
                                    Logarithmic
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

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
                              Fee earned on each transaction (max 10%)
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

                {/* Advanced Options */}
                <Card className="pulse-border">
                  <CardHeader>
                    <CardTitle>Advanced Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableNftIntegration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              NFT Integration
                            </FormLabel>
                            <FormDescription>
                              Enable limited NFT mints for token holders
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {(watchedMode === "amm" || watchedMode === "curve") && (
                      <FormField
                        control={form.control}
                        name="seedLiquidity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Liquidity (ICP)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="10"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              ICP to provide as initial liquidity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
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
                      <Badge variant="secondary">{watchedMode.toUpperCase()}</Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Starting Price:
                        </span>
                        <span className="font-medium">
                          {watchedBasePrice || 0} ICP
                        </span>
                      </div>

                      {watchedMode === "fixed" && watchedSupply && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total Supply:
                            </span>
                            <span className="font-medium">
                              {watchedSupply.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Est. Market Cap:
                            </span>
                            <span className="font-medium">
                              {estimatedMarketCap} ICP
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Creator Fee:
                        </span>
                        <span className="font-medium">
                          {form.watch("royaltyPercent") || 0}%
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
                      <span>Platform Fee:</span>
                      <span>0.1 ICP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gas/Cycles:</span>
                      <span>~0.01 ICP</span>
                    </div>
                    {form.watch("seedLiquidity") && (
                      <div className="flex justify-between text-sm">
                        <span>Initial Liquidity:</span>
                        <span>{form.watch("seedLiquidity")} ICP</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="text-pulse-primary">
                        {(0.11 + (form.watch("seedLiquidity") || 0)).toFixed(2)} ICP
                      </span>
                    </div>
                  </CardContent>
                </Card>
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
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
