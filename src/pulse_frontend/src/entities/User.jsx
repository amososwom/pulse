export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.avatar = data.avatar || '';
    this.createdAt = data.createdAt || new Date();
    this.tokens = data.tokens || [];
    this.balance = data.balance || 0;
  }

  // Add any user-related methods here
  getDisplayName() {
    return this.username || this.email;
  }

  hasTokens() {
    return this.tokens.length > 0;
  }

  addToken(token) {
    this.tokens.push(token);
  }

  removeToken(tokenId) {
    this.tokens = this.tokens.filter(token => token.id !== tokenId);
  }
}

export default User;