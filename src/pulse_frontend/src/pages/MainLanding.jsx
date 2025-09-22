import React, { useState } from "react";

// Layout component - correct path based on your file structure
import Layout from "../entities/Layout";

// Landing page components
import ContactSection from "@/components/landing/ContactSection";
import FAQSection from "@/components/landing/FAQSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import InternetIdentityModal from "@/components/landing/InternetIdentityModal";
import TokenomicsSection from "@/components/landing/TokenomicsSection";
import VideoSection from "@/components/landing/VideoSection";

// Home pag@ components
import FeaturedCreators from "@/components/home/FeaturedCreators";
import PlatformStats from "@/components/home/PlatformStats";
import { useNavigate } from "react-router-dom";
// import AdminDashboard from "@/components/admin/AdminDashboard";

// Optional: Import NFID SDK if you choose to use it
// import { NFID } from '@nfid/embed';

function MainLanding() {
  // Modal state management
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticationMethod, setAuthenticationMethod] = useState(null);

  const goto = useNavigate()
  // Optional: Initialize NFID SDK (uncomment if using SDK approach)
  /*
  const nfid = NFID.init({
    application: {
      name: "PULSE",
      logo: "https://your-app-logo-url.com/logo.png" // Replace with your actual logo URL
    },
    identity: {
      methods: ["email", "webauthn"], // Exclude Google/social logins
    },
    ui: {
      theme: {
        primary: "#0f172a",
        background: "#ffffff",
        text: "#1e293b"
      },
      hideSocialLogins: true,
      preferredMethod: "email"
    }
  });
  */

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleInternetIdentity = async () => {
    setIsAuthenticating(true);
    goto('/login');
    
    try {
      // Simulate Internet Identity authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Internet Identity authentication successful!");
      
      // Close modal and navigate to dashboard
      setShowAuthModal(false);
      
      // In a real app, you'd navigate to dashboard
      alert("Internet Identity authentication successful! Welcome to PULSE!");
      
    } catch (error) {
      console.error("Internet Identity authentication failed:", error);
      alert("Authentication failed. Please try again.");
    }
    
    setIsAuthenticating(false);
    setAuthenticationMethod(null);
  };

  // Method 1: Using URL Parameters (Try this first)
  const handleNFID = async () => {
    setIsAuthenticating(true);
    setAuthenticationMethod('nfid');
    
    try {
      // Try different URL configurations to get the desired interface
      const nfidConfigurations = [
        // Configuration 1: Email-first flow
        'https://nfid.one/authenticate/#authorize?flow=email-first&disable_google=true',
        
        // Configuration 2: Specific methods only
        'https://nfid.one/authenticate/#authorize?methods=email,passkey&hide_social=true',
        
        // Configuration 3: Minimal UI
        'https://nfid.one/authenticate/#authorize?ui=minimal&providers=email,webauthn',
        
        // Configuration 4: Custom parameters
        `https://nfid.one/authenticate/#authorize?` +
        `applicationName=PULSE&` +
        `disableGoogleAuth=true&` +
        `authMethods=email,passkey&` +
        `redirectUri=${encodeURIComponent(window.location.origin)}&` +
        `theme=minimal`
      ];
      
      // Use the first configuration (you can test others by changing the index)
      const nfidUrl = nfidConfigurations[0];
      
      console.log("Opening NFID with URL:", nfidUrl);
      
      // Calculate center position for popup
      const left = window.screen.width / 2 - 250;
      const top = window.screen.height / 2 - 350;
      
      const popup = window.open(
        nfidUrl,
        'nfid-auth',
        `width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no,left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }

      // Enhanced popup monitoring with better UX
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log("NFID authentication window closed");
          
          // Simulate checking for authentication success
          // In a real implementation, you'd verify tokens/credentials here
          setTimeout(() => {
            setShowAuthModal(false);
            alert("NFID authentication successful! Welcome to PULSE!");
            setIsAuthenticating(false);
            setAuthenticationMethod(null);
          }, 500);
        }
      }, 1000);

      // Add timeout protection (5 minutes)
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
          setIsAuthenticating(false);
          setAuthenticationMethod(null);
          alert('Authentication timeout. Please try again.');
        }
      }, 300000); // 5 minutes
      
    } catch (error) {
      console.error("NFID authentication failed:", error);
      alert(`Authentication failed: ${error.message}`);
      setIsAuthenticating(false);
      setAuthenticationMethod(null);
    }
  };

  // Method 2: Using NFID SDK (Alternative approach - uncomment to use)
  /*
  const handleNFIDWithSDK = async () => {
    setIsAuthenticating(true);
    setAuthenticationMethod('nfid');
    
    try {
      const authClient = await nfid.getDelegation({
        targets: [],
        derivationOrigin: window.location.origin,
        ui: {
          width: 500,
          height: 700,
          flow: "email-first",
          hideGoogleAuth: true,
          methods: ["email", "passkey"]
        }
      });

      if (authClient) {
        console.log("NFID authentication successful!", authClient);
        setShowAuthModal(false);
        alert("NFID authentication successful! Welcome to PULSE!");
      }
      
    } catch (error) {
      console.error("NFID authentication failed:", error);
      
      if (error.message.includes('User cancelled')) {
        console.log("User cancelled authentication");
      } else {
        alert(`Authentication failed: ${error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
      setAuthenticationMethod(null);
    }
  };
  */

  // Method 3: Direct NFID Integration (Another alternative)
  const handleNFIDDirect = async () => {
    setIsAuthenticating(true);
    setAuthenticationMethod('nfid');
    
    try {
      // This URL should give you the email-first interface like in your screenshot
      const nfidUrl = 'https://nfid.one/authenticate/#authorize?' + 
        new URLSearchParams({
          flow: 'email-first',
          disable_google: 'true',
          methods: 'email,passkey',
          redirect_uri: window.location.origin,
          application_name: 'PULSE',
          hide_social: 'true'
        }).toString();
      
      console.log("Opening NFID Direct with URL:", nfidUrl);
      
      const left = window.screen.width / 2 - 250;
      const top = window.screen.height / 2 - 350;
      
      const popup = window.open(
        nfidUrl,
        'nfid-auth',
        `width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no,left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setShowAuthModal(false);
          alert("NFID authentication successful! Welcome to PULSE!");
          setIsAuthenticating(false);
          setAuthenticationMethod(null);
        }
      }, 1000);

      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
          setIsAuthenticating(false);
          setAuthenticationMethod(null);
          alert('Authentication timeout. Please try again.');
        }
      }, 300000);
      
    } catch (error) {
      console.error("NFID authentication failed:", error);
      alert(`Authentication failed: ${error.message}`);
      setIsAuthenticating(false);
      setAuthenticationMethod(null);
    }
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    setIsAuthenticating(false);
    setAuthenticationMethod(null);
  };

  return (
    <div className="App">
      <Layout>
        {/* Landing Page Content - Pass the modal handler to HeroSection */}
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
        <HowItWorks />
        <TokenomicsSection />
        <VideoSection />
        <FAQSection />
        <ContactSection />
        
        {/* Platform Stats for dashboard */}
        <PlatformStats />
        <FeaturedCreators />
        
        {/* Enhanced Internet Identity Modal with NFID Support */}
        <InternetIdentityModal 
          isOpen={showAuthModal}
          onClose={handleCloseModal}
          onAuthenticate={handleInternetIdentity}
          onNFID={handleNFID} // You can switch to handleNFIDDirect or handleNFIDWithSDK
          isLoading={isAuthenticating}
          authMethod={authenticationMethod}
        />
      </Layout>
    </div>
  );
}

export default MainLanding;