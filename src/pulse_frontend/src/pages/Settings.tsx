import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Wallet,
  Trash2,
  ArrowLeft,
  Save,
  Key,
  Download,
  Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    tradingAlerts: true,
    weeklyDigest: true,
    twoFactorAuth: false,
    publicProfile: true,
    showHoldings: false,
    currency: 'USD',
    language: 'en',
    theme: 'dark',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 1000);
  };

  const handleExportData = () => {
    // Simulate data export
    toast({
      title: "Export initiated",
      description: "Your data export will be ready in a few minutes. You'll receive an email when it's complete.",
    });
  };

  const handleDeleteAccount = () => {
    // In real app, this would delete the account
    toast({
      title: "Account deletion initiated",
      description: "Your account deletion request has been submitted. This action cannot be undone.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="pulse-card-gradient pulse-shadow border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>Your account details and security status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Principal ID</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {user?.principal}
                    </code>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {user?.type}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                  {settings.twoFactorAuth && (
                    <Badge variant="outline" className="text-success border-success">
                      Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="pulse-card-gradient pulse-shadow border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Control how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get real-time alerts in your browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Trading Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for price changes and trades
                    </p>
                  </div>
                  <Switch
                    checked={settings.tradingAlerts}
                    onCheckedChange={(checked) => handleSettingChange('tradingAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of your activity and market updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="pulse-card-gradient pulse-shadow border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Visibility</span>
              </CardTitle>
              <CardDescription>Control who can see your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to view your profile
                  </p>
                </div>
                <Switch
                  checked={settings.publicProfile}
                  onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Holdings</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your token holdings publicly
                  </p>
                </div>
                <Switch
                  checked={settings.showHoldings}
                  onCheckedChange={(checked) => handleSettingChange('showHoldings', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="pulse-card-gradient pulse-shadow border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5" />
                <span>Preferences</span>
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="ICP">ICP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Account */}
          <Card className="pulse-card-gradient pulse-shadow border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Data & Account</span>
              </CardTitle>
              <CardDescription>Manage your data and account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download all your account data
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <Label className="text-sm font-medium text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers, including your tokens and transaction history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="pulse-gradient hover:opacity-90 pulse-transition"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;