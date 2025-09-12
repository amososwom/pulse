# Pulse — Creator Coins on the Internet Computer (ICP)

## 🌐 Overview

Pulse is a creator economy platform built **fully on-chain** using the **Internet Computer (ICP)**. It enables influencers, creators, and brands to launch their own tokens, monetize their communities, and allow fans to trade these tokens seamlessly. By leveraging ICP’s unique tech stack — **Internet Identity, Motoko Canisters, Chain Fusion, and reverse gas model** — Pulse delivers a Web3 experience without the usual Web2 friction.

---

## 🚀 Features

* **Creator Tokens:** Influencers can create their own tokens (e.g., CloutCoins, Pulse Tokens).
* **On-chain Marketplace:** Fans can buy, sell, and trade tokens on a decentralized marketplace.
* **Internet Identity Login:** Secure, passwordless authentication for all users.
* **Cross-chain Payments (Chain Fusion):** Accept ICP, Bitcoin, and Ethereum for token purchases.
* **Zero Gas Fees for Users:** Thanks to ICP’s reverse gas model, fans don’t pay gas.
* **Fair Economics:** Tokens gain value as demand rises; supply is controlled via bonding curves or fixed supply.

---

## ⚙️ How It Works

1. **Creator Onboarding**

   * Log in using **Internet Identity**.
   * Register and create a personal token (with supply model: Fixed or Bonding Curve).

2. **Fan Interaction**

   * Fans log in with Internet Identity.
   * Purchase creator tokens using ICP or cross-chain assets (BTC/ETH via Chain Fusion).
   * Trade tokens in the Pulse marketplace.

3. **Growth & Value**

   * As fans buy, token demand rises, increasing token value.
   * Owners (creators) can also purchase back their tokens — at market price — maintaining fairness.

4. **Revenue Model**

   * **Minting Fees:** A cut from every new token minted.
   * **Transaction Fees:** A small percentage fee on all trades.
   * **Optional Withdrawal Fees:** For converting tokens back into ICP or BTC/ETH.

---

## 🏗️ Tech Stack

* **Smart Contracts:** Motoko Canisters

  * Token Ledger Canister (balances, transfers, minting)
  * Marketplace Canister (buy/sell, bonding curve, trading fees)
  * Registry Canister (metadata for creator tokens)
* **Authentication:** Internet Identity
* **Cross-chain:** Chain Fusion (BTC/ETH integrations)
* **Frontend:** React + TailwindCSS + `@dfinity/agent`
* **Hosting:** ICP Canisters (frontend + backend all on-chain)

---

## 📈 MVP Scope

For hackathon/demo purposes, the MVP includes:

* Creator token creation flow (with Internet Identity login).
* Token registry canister.
* Simple marketplace with buy/sell.
* Fee collection system.
* React UI showing balances, token price, and transaction history.

**Stretch Goals:**

* Chain Fusion demo: buying tokens with BTC/ETH.
* NFT module: exclusive fan NFTs tied to creator tokens.
* Analytics dashboard for token growth.

---

## 🎯 Why ICP?

* **Internet Identity:** Easy, secure login without Web2 credentials.
* **Reverse Gas Model:** No gas for end-users, boosting adoption.
* **Chain Fusion:** Direct integration with Bitcoin/Ethereum for real liquidity.
* **Full On-chain Deployment:** Both frontend and backend hosted on ICP canisters.

---

## 🏆 Hackathon Pitch

> Pulse empowers creators to monetize influence by launching their own tokens directly on the Internet Computer. Fans log in with Internet Identity, trade tokens with ICP or Bitcoin via Chain Fusion, and experience true Web3 without gas fees. Our platform earns through minting and trading fees, ensuring sustainability and scalability.

---

## 📂 Project Structure

```
Pulse/
├── src/
│   ├── backend/
│   │   ├── token_canister.mo
│   │   ├── marketplace_canister.mo
│   │   └── registry_canister.mo
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── App.jsx
│   │   └── package.json
├── README.md
└── dfx.json
```

---

## 🔮 Future Vision

* Expand beyond tokens into **creator NFTs**, event tickets, and gated fan experiences.
* Provide creators with **analytics dashboards** for engagement tracking.
* Enable **treasury pools and DAO governance** for creator-fan communities.

---

## 🤝 Contributing

We welcome contributions from developers, designers, and blockchain enthusiasts. Submit a PR or open an issue to join the Pulse movement.

---

## 📜 License

MIT License — free to use, build, and expand.
