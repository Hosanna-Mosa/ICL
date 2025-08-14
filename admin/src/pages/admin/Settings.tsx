import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Store,
  CreditCard,
  Mail,
  Shield,
  Database,
  Bell,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import adminApi from '@/utils/api';

interface GeneralSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  currency: string;
  timezone: string;
}

interface PaymentSettings {
  phonepeMerchantId: string;
  phonepeMerchantKey: string;
  phonepeEnvironment: 'UAT' | 'PROD';
  upiEnabled: boolean;
  codEnabled: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
}

interface EmailSettings {
  emailService: 'gmail' | 'smtp';
  emailHost: string;
  emailPort: number;
  emailUser: string;
  emailPass: string;
  emailFrom: string;
  emailSecure: boolean;
}

interface SecuritySettings {
  jwtSecret: string;
  jwtExpire: string;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
  sessionTimeout: number;
  requireTwoFactor: boolean;
}

interface SystemSettings {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  userNotifications: boolean;
  systemNotifications: boolean;
  notificationEmail: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Settings state
  const [general, setGeneral] = useState<GeneralSettings>({
          storeName: 'BRELIS Streetwear',
    storeDescription: 'Premium streetwear fashion brand',
          contactEmail: 'contact@brelisstreetwear.com',
    contactPhone: '+91 9999999999',
    address: '123 Fashion Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });
  
  const [payment, setPayment] = useState<PaymentSettings>({
    phonepeMerchantId: '',
    phonepeMerchantKey: '',
    phonepeEnvironment: 'UAT',
    upiEnabled: true,
    codEnabled: true,
    minOrderAmount: 100,
    maxOrderAmount: 50000
  });
  
  const [email, setEmail] = useState<EmailSettings>({
    emailService: 'gmail',
    emailHost: 'smtp.gmail.com',
    emailPort: 587,
    emailUser: '',
    emailPass: '',
          emailFrom: 'BRELIS Streetwear <noreply@brelisstreetwear.com>',
    emailSecure: false
  });
  
  const [security, setSecurity] = useState<SecuritySettings>({
    jwtSecret: 'your-super-secret-jwt-key-change-this-in-production',
    jwtExpire: '7d',
    rateLimitWindow: 900000,
    rateLimitMaxRequests: 100,
    sessionTimeout: 3600,
    requireTwoFactor: false
  });
  
  const [system, setSystem] = useState<SystemSettings>({
    nodeEnv: 'development',
    port: 5000,
    frontendUrl: 'http://localhost:5173',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: ''
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    orderNotifications: true,
    userNotifications: true,
    systemNotifications: true,
          notificationEmail: 'admin@brelisstreetwear.com'
  });

  const { toast } = useToast();

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.settings.getAll();
      if (response.success && response.data) {
        const settings = response.data;
        setGeneral(settings.general || general);
        setPayment(settings.payment || payment);
        setEmail(settings.email || email);
        setSecurity(settings.security || security);
        setSystem(settings.system || system);
        setNotifications(settings.notifications || notifications);
        
        toast({
          title: "Settings loaded",
          description: "Settings loaded successfully from server",
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [general, payment, email, security, system, notifications, toast]);

  useEffect(() => {
    if (!initialized) {
      loadSettings();
      setInitialized(true);
    }
  }, [initialized, loadSettings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const saveSettings = useCallback(async (section: string) => {
    try {
      setSaving(true);
      
      let response;
      let sectionKey;
      
      switch (section) {
        case 'General':
          sectionKey = 'general';
          response = await adminApi.settings.updateSection(sectionKey, general);
          break;
        case 'Payment':
          sectionKey = 'payment';
          response = await adminApi.settings.updateSection(sectionKey, payment);
          break;
        case 'Email':
          sectionKey = 'email';
          response = await adminApi.settings.updateSection(sectionKey, email);
          break;
        case 'Security':
          sectionKey = 'security';
          response = await adminApi.settings.updateSection(sectionKey, security);
          break;
        case 'System':
          sectionKey = 'system';
          response = await adminApi.settings.updateSection(sectionKey, system);
          break;
        case 'Notifications':
          sectionKey = 'notifications';
          response = await adminApi.settings.updateSection(sectionKey, notifications);
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
      
      if (response.success) {
        toast({
          title: "Settings saved",
          description: `${section} settings updated successfully`,
        });
      }
    } catch (error: any) {
      console.error(`Error saving ${section} settings:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to save ${section} settings`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [general, payment, email, security, system, notifications, toast]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  }, [toast]);

  const testConnection = useCallback(async (type: string) => {
    try {
      setLoading(true);
      
      let connectionType;
      switch (type) {
        case 'PhonePe':
          connectionType = 'phonepe';
          break;
        case 'Email':
          connectionType = 'email';
          break;
        case 'Cloudinary':
          connectionType = 'cloudinary';
          break;
        default:
          connectionType = type.toLowerCase();
      }
      
      const response = await adminApi.settings.testConnection(connectionType);
      
      if (response.success) {
        toast({
          title: "Connection successful",
          description: `${type} connection test passed`,
        });
      }
    } catch (error: any) {
      console.error(`Error testing ${type} connection:`, error);
      toast({
        title: "Connection failed",
        description: error.message || `${type} connection test failed`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleGeneralChange = useCallback((field: keyof GeneralSettings, value: any) => {
    setGeneral(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePaymentChange = useCallback((field: keyof PaymentSettings, value: any) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEmailChange = useCallback((field: keyof EmailSettings, value: any) => {
    setEmail(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSecurityChange = useCallback((field: keyof SecuritySettings, value: any) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSystemChange = useCallback((field: keyof SystemSettings, value: any) => {
    setSystem(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNotificationChange = useCallback((field: keyof NotificationSettings, value: any) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your store configuration and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSettings}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSecrets(!showSecrets)}
            className="flex items-center space-x-2"
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={general.storeName}
                    onChange={(e) => handleGeneralChange('storeName', e.target.value)}
                    placeholder="Enter store name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={general.contactEmail}
                    onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
                    placeholder="contact@store.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={general.contactPhone}
                    onChange={(e) => handleGeneralChange('contactPhone', e.target.value)}
                    placeholder="+91 9999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={general.currency} onValueChange={(value) => handleGeneralChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={general.storeDescription}
                  onChange={(e) => handleGeneralChange('storeDescription', e.target.value)}
                  placeholder="Describe your store..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={general.address}
                    onChange={(e) => handleGeneralChange('address', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={general.city}
                    onChange={(e) => handleGeneralChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={general.state}
                    onChange={(e) => handleGeneralChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={general.pincode}
                    onChange={(e) => handleGeneralChange('pincode', e.target.value)}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('General')}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Configuration</CardTitle>
              <CardDescription>
                Configure your payment gateways and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">PhonePe Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phonepeMerchantId">Merchant ID</Label>
                    <Input
                      id="phonepeMerchantId"
                      value={payment.phonepeMerchantId}
                      onChange={(e) => handlePaymentChange('phonepeMerchantId', e.target.value)}
                      placeholder="Enter PhonePe merchant ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phonepeMerchantKey">Merchant Key</Label>
                    <div className="relative">
                      <Input
                        id="phonepeMerchantKey"
                        type={showSecrets ? "text" : "password"}
                        value={payment.phonepeMerchantKey}
                        onChange={(e) => handlePaymentChange('phonepeMerchantKey', e.target.value)}
                        placeholder="Enter PhonePe merchant key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => copyToClipboard(payment.phonepeMerchantKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phonepeEnvironment">Environment</Label>
                    <Select value={payment.phonepeEnvironment} onValueChange={(value: 'UAT' | 'PROD') => handlePaymentChange('phonepeEnvironment', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UAT">UAT (Testing)</SelectItem>
                        <SelectItem value="PROD">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Test Connection</Label>
                    <Button
                      variant="outline"
                      onClick={() => testConnection('PhonePe')}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                      Test PhonePe Connection
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="upiEnabled"
                      checked={payment.upiEnabled}
                      onCheckedChange={(checked) => handlePaymentChange('upiEnabled', checked)}
                    />
                    <Label htmlFor="upiEnabled">Enable UPI Payments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="codEnabled"
                      checked={payment.codEnabled}
                      onCheckedChange={(checked) => handlePaymentChange('codEnabled', checked)}
                    />
                    <Label htmlFor="codEnabled">Enable Cash on Delivery</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      value={payment.minOrderAmount}
                      onChange={(e) => handlePaymentChange('minOrderAmount', Number(e.target.value))}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOrderAmount">Maximum Order Amount (₹)</Label>
                    <Input
                      id="maxOrderAmount"
                      type="number"
                      value={payment.maxOrderAmount}
                      onChange={(e) => handlePaymentChange('maxOrderAmount', Number(e.target.value))}
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('Payment')}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email service for notifications and communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailService">Service Type</Label>
                    <Select value={email.emailService} onValueChange={(value: 'gmail' | 'smtp') => handleEmailChange('emailService', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmail">Gmail</SelectItem>
                        <SelectItem value="smtp">Custom SMTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailFrom">From Email</Label>
                    <Input
                      id="emailFrom"
                      type="email"
                      value={email.emailFrom}
                      onChange={(e) => handleEmailChange('emailFrom', e.target.value)}
                      placeholder="noreply@store.com"
                    />
                  </div>
                </div>
              </div>

              {email.emailService === 'smtp' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">SMTP Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emailHost">SMTP Host</Label>
                        <Input
                          id="emailHost"
                          value={email.emailHost}
                          onChange={(e) => handleEmailChange('emailHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailPort">SMTP Port</Label>
                        <Input
                          id="emailPort"
                          type="number"
                          value={email.emailPort}
                          onChange={(e) => handleEmailChange('emailPort', Number(e.target.value))}
                          placeholder="587"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailUser">SMTP Username</Label>
                        <Input
                          id="emailUser"
                          value={email.emailUser}
                          onChange={(e) => handleEmailChange('emailUser', e.target.value)}
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailPass">SMTP Password</Label>
                        <Input
                          id="emailPass"
                          type={showSecrets ? "text" : "password"}
                          value={email.emailPass}
                          onChange={(e) => handleEmailChange('emailPass', e.target.value)}
                          placeholder="App password or SMTP password"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailSecure"
                        checked={email.emailSecure}
                        onCheckedChange={(checked) => handleEmailChange('emailSecure', checked)}
                      />
                      <Label htmlFor="emailSecure">Use SSL/TLS</Label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => testConnection('Email')}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Test Email Connection
                </Button>
                <Button 
                  onClick={() => saveSettings('Email')}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Configure security settings and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">JWT Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jwtSecret">JWT Secret</Label>
                    <div className="relative">
                      <Input
                        id="jwtSecret"
                        type={showSecrets ? "text" : "password"}
                        value={security.jwtSecret}
                        onChange={(e) => handleSecurityChange('jwtSecret', e.target.value)}
                        placeholder="Enter JWT secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => copyToClipboard(security.jwtSecret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jwtExpire">JWT Expiry</Label>
                    <Select value={security.jwtExpire} onValueChange={(value) => handleSecurityChange('jwtExpire', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expiry time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rate Limiting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitWindow">Window (minutes)</Label>
                    <Input
                      id="rateLimitWindow"
                      type="number"
                      value={security.rateLimitWindow / 60000}
                      onChange={(e) => handleSecurityChange('rateLimitWindow', Number(e.target.value) * 60000)}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitMaxRequests">Max Requests</Label>
                    <Input
                      id="rateLimitMaxRequests"
                      type="number"
                      value={security.rateLimitMaxRequests}
                      onChange={(e) => handleSecurityChange('rateLimitMaxRequests', Number(e.target.value))}
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => handleSecurityChange('sessionTimeout', Number(e.target.value))}
                      placeholder="3600"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireTwoFactor"
                      checked={security.requireTwoFactor}
                      onCheckedChange={(checked) => handleSecurityChange('requireTwoFactor', checked)}
                    />
                    <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('Security')}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                System-level configuration and environment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Environment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nodeEnv">Node Environment</Label>
                    <Select value={system.nodeEnv} onValueChange={(value) => handleSystemChange('nodeEnv', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Server Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={system.port}
                      onChange={(e) => handleSystemChange('port', Number(e.target.value))}
                      placeholder="5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frontendUrl">Frontend URL</Label>
                    <Input
                      id="frontendUrl"
                      value={system.frontendUrl}
                      onChange={(e) => handleSystemChange('frontendUrl', e.target.value)}
                      placeholder="http://localhost:5173"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cloudinary Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
                    <Input
                      id="cloudinaryCloudName"
                      value={system.cloudinaryCloudName}
                      onChange={(e) => handleSystemChange('cloudinaryCloudName', e.target.value)}
                      placeholder="your-cloud-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryApiKey">API Key</Label>
                    <Input
                      id="cloudinaryApiKey"
                      type={showSecrets ? "text" : "password"}
                      value={system.cloudinaryApiKey}
                      onChange={(e) => handleSystemChange('cloudinaryApiKey', e.target.value)}
                      placeholder="Enter Cloudinary API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryApiSecret">API Secret</Label>
                    <Input
                      id="cloudinaryApiSecret"
                      type={showSecrets ? "text" : "password"}
                      value={system.cloudinaryApiSecret}
                      onChange={(e) => handleSystemChange('cloudinaryApiSecret', e.target.value)}
                      placeholder="Enter Cloudinary API secret"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Test Connection</Label>
                    <Button
                      variant="outline"
                      onClick={() => testConnection('Cloudinary')}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                      Test Cloudinary
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('System')}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                    <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                  </div>
                  
                  {notifications.emailNotifications && (
                    <div className="space-y-2">
                      <Label htmlFor="notificationEmail">Notification Email</Label>
                      <Input
                        id="notificationEmail"
                        type="email"
                        value={notifications.notificationEmail}
                        onChange={(e) => handleNotificationChange('notificationEmail', e.target.value)}
                        placeholder="admin@store.com"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orderNotifications"
                      checked={notifications.orderNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('orderNotifications', checked)}
                    />
                    <Label htmlFor="orderNotifications">Order Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="userNotifications"
                      checked={notifications.userNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('userNotifications', checked)}
                    />
                    <Label htmlFor="userNotifications">User Activity Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="systemNotifications"
                      checked={notifications.systemNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('systemNotifications', checked)}
                    />
                    <Label htmlFor="systemNotifications">System Notifications</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('Notifications')}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Bar - Only show when saving */}
      {saving && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-background border rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Saving settings...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Settings);
