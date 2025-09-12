# Pulse — Creator Coins on the Internet Computer (ICP)

<p align="center">
  <img src="./src/pulse_frontend/public/pulse.png" alt="Pulse Banner" background="#34ebcc" width="400"/>
</p>

## 🌐 Overview

**Pulse** is a decentralized platform built on the **Internet Computer (ICP)** using **Motoko** and **React**. It empowers **influencers, businesses, and creators** to mint their own community-driven digital tokens (like NFTs or branded coins) directly on-chain. These tokens can be **created, traded, and marketed** to their audience without intermediaries.

Pulse leverages:

* **Motoko Canisters** for secure, on-chain token logic.
* **Internet Identity** for seamless authentication.
* **Chain Fusion** (ICP interoperability) for future cross-chain growth.
* **React Frontend** for an interactive user experience.


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

## 🚀  Features

* 🎨 **Custom Creator Tokens**: Influencers or brands can mint their own tokens.
* 💱 **Buy, Sell & Trade**: Fans and supporters can trade tokens peer-to-peer.
* 🔒 **On-Chain Security**: Built on ICP, ensuring decentralization and trust.
* 🧩 **Internet Identity Login**: Secure, passwordless login.
* 💰 **Earnings Model**:

  * Platform fee for token creation.
  * Transaction fees for buys/sells.
  * Transfer fees when tokens are sent peer-to-peer.

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

## Use Cases

* **Influencers**: Launch branded community tokens.
* **Businesses**: Tokenize loyalty programs or rewards.
* **Artists & Creators**: Offer collectible NFTs or fan tokens.
* **Traders**: Engage in buying/selling creator tokens for profit.

---

## Architecture

* **Frontend**: React + Vite
* **Backend**: Motoko Canisters on ICP
* **Auth**: Internet Identity
* **Deployment**: DFX + Canister model

---


## 🔮 Future Vision

* Expand beyond tokens into **creator NFTs**, event tickets, and gated fan experiences.
* Provide creators with **analytics dashboards** for engagement tracking.
* Enable **treasury pools and DAO governance** for creator-fan communities.

---

## 🤝 Contributing

We welcome contributions from developers, designers, and blockchain enthusiasts. Submit a PR or open an issue to join the Pulse movement.

---

## Quick Start

Welcome to your new `pulse` project and to the Internet Computer development community. By default, creating a new project adds this README and some template files to your project directory. You can edit these template files to customize your project and to include your own code to speed up the development cycle.

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

To learn more before you start working with `pulse`, see the following documentation available online:

* [Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
* [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/setup/install)
* [Motoko Programming Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko)
* [Motoko Language Quick Reference](https://internetcomputer.org/docs/current/motoko/main/language-manual)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd pulse/
dfx help
dfx canister --help
```

### Running the Project Locally

```bash
# Start replica in background
dfx start --background

# Deploy canisters
dfx deploy
```

App will be available at:

```
http://localhost:4943?canisterId={asset_canister_id}
```

If you modify your backend canister:

```bash
npm run generate
```

If you modify your frontend:

```bash
npm start
```

This will start at `http://localhost:8080`, proxying to the local replica.

### Environment Notes

When hosting frontend code outside DFX, ensure:

* Set `DFX_NETWORK=ic` (if using Webpack).
* Replace `process.env.DFX_NETWORK` manually or via `dfx.json`.
* Alternatively, write your own `createActor` constructor.

---

## Roadmap (MVP → Beyond)

* ✅ Token creation module
* ✅ Internet Identity integration
* 🔄 Token trading marketplace
* 🚀 Cross-chain interoperability via Chain Fusion
* 📈 Analytics for creators
* 💳 Fiat-to-token onramp (future)

---

## License

MIT © Pulse Team
