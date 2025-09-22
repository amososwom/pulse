// Utility function to create page URLs
export function createPageUrl(page, params = {}) {
  // Convert page name to lowercase route
  const route = page.toLowerCase();
  
  // If using React Router
  if (window.location.pathname !== undefined) {
    let url = `/${route}`;
    
    const queryParams = new URLSearchParams(params);
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    return url;
  }
  
  // Fallback for hash routing
  let url = `#/${route}`;
  const queryParams = new URLSearchParams(params);
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  return url;
}

// Navigation helper for programmatic navigation
export function navigateTo(page, params = {}) {
  const url = createPageUrl(page, params);
  
  // If using React Router, this should be handled by useNavigate hook
  // This is a fallback for direct navigation
  if (url.startsWith('/')) {
    window.history.pushState({}, '', url);
  } else {
    window.location.href = url;
  }
}

// Utility function for classnames (similar to clsx)
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ');
}

// Format currency values
export function formatCurrency(amount, currency = 'ICP') {
  return `${amount.toFixed(4)} ${currency}`;
}

// Format large numbers
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format percentage
export function formatPercentage(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// Truncate text
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Route definitions
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  CREATE: '/create',
  MARKET: '/market',
  TOKEN: '/token'
};

// NFID Authentication Helper
export class NFIDAuth {
  constructor() {
    this.popup = null;
    this.messageListener = null;
  }

  // Open NFID authentication popup
  authenticate(redirectUrl = window.location.origin) {
    return new Promise((resolve, reject) => {
      // Construct NFID URL with proper parameters
      const nfidUrl = new URL('https://nfid.one/authenticate/');
      nfidUrl.hash = '#authorize';
      nfidUrl.searchParams.set('applicationName', 'PULSE');
      nfidUrl.searchParams.set('applicationLogo', `${redirectUrl}/logo.png`);
      nfidUrl.searchParams.set('derivationOrigin', redirectUrl);

      // Open popup window
      const popup = window.open(
        nfidUrl.toString(),
        'nfid-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      this.popup = popup;

      // Listen for messages from popup
      this.messageListener = (event) => {
        // Validate origin
        if (!event.origin.includes('nfid.one')) {
          return;
        }

        console.log('NFID Message received:', event.data);

        // Handle successful authentication
        if (event.data.type === 'NFID_READY' || 
            event.data.success || 
            event.data.identity) {
          this.cleanup();
          resolve({
            success: true,
            identity: event.data.identity || event.data,
            principal: event.data.principal
          });
        }

        // Handle authentication error
        if (event.data.type === 'NFID_ERROR' || event.data.error) {
          this.cleanup();
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      window.addEventListener('message', this.messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          this.cleanup();
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popup.closed) {
          this.cleanup();
          reject(new Error('Authentication timeout'));
        }
      }, 300000);
    });
  }

  // Clean up event listeners and popup
  cleanup() {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }
    this.popup = null;
  }
}

// Internet Identity helper (placeholder for now)
export class InternetIdentityAuth {
  static async authenticate() {
    // This would integrate with @dfinity/auth-client in a real app
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          identity: 'internet-identity-user',
          principal: 'rdmx6-jaaaa-aaaah-qdrqq-cai'
        });
      }, 2000);
    });
  }
}