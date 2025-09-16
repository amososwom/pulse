# Pulse — Creator Coins on the Internet Computer (ICP)

<p align="center">
  <img src="./docs/banner.png" alt="Pulse Banner" width="400"/>
</p>

---

## 🌐 Overview

**Pulse** is a decentralized platform built on the **Internet Computer (ICP)** using **Motoko** and **React**. It empowers **influencers, businesses, and creators** to mint their own community-driven digital tokens (like NFTs or branded coins) directly on-chain. These tokens can be **created, traded, and marketed** to their audience without intermediaries.

Pulse leverages:

* ⚡ **Motoko Canisters** for secure, on-chain token logic.
* 🔑 **Internet Identity** for seamless authentication.
* 🔗 **Chain Fusion** (ICP interoperability) for cross-chain growth.
* 🎨 **React Frontend** for an interactive user experience.

---

## 🚀 Features

* 🎨 **Custom Creator Tokens**: Influencers or brands can mint their own tokens.
* 💱 **Buy, Sell & Trade**: Fans and supporters can trade tokens peer-to-peer.
* 🔒 **On-Chain Security**: Built on ICP, ensuring decentralization and trust.
* 🖼 **Branding Support**: Creators can upload or link a logo/banner (image URL). In MVP, this is stored in metadata. Future versions will use **IPFS** or **ICP asset canisters** for permanent decentralized storage.
* 🧩 **Internet Identity Login**: Secure, passwordless login.
* 💰 **Earnings Model**:

  * Platform fee for token creation.
  * Transaction fees for buys/sells.
  * Transfer fees for peer-to-peer token sends.

---

## 🎯 Use Cases

* 🌟 **Influencers**: Launch branded community tokens.
* 🏢 **Businesses**: Tokenize loyalty programs or rewards.
* 🎨 **Artists & Creators**: Offer collectible NFTs or fan tokens.
* 📈 **Traders**: Engage in buying/selling creator tokens for profit.

---

## 🏗️ Architecture

* **Frontend**: React + Vite + TailwindCSS
* **Backend**: Motoko Canisters on ICP
* **Auth**: Internet Identity
* **Cross-chain**: Chain Fusion (BTC/ETH)
* **Deployment**: DFX + Canister model

---

## 🧩 Token Metadata Structure (Motoko)

```motoko
type TokenMetadata = {
  name : Text;
  symbol : Text;
  supply : Nat;
  imageUrl : Text; // branding logo/banner provided by creator
  creator : Principal;
};
```

---

## ⚡ Quick Start

```bash
cd pulse/
dfx start --background
dfx deploy
```

App will be available at:

```
http://localhost:4943?canisterId={asset_canister_id}
```

For frontend development:

```bash
npm start
```

---

## 🛣️ Roadmap (MVP → Beyond)

* ✅ Token creation module (with branding image URL)
* ✅ Internet Identity integration
* 🔄 Token trading marketplace
* 🚀 Cross-chain interoperability via Chain Fusion
* 📊 Analytics for creators
* 💳 Fiat-to-token onramp (future)
* 👥 DAO-style governance for creator-fan communities

---

## 🔮 Future Vision

* Expand beyond tokens into **creator NFTs**, event tickets, and gated fan experiences.
* Provide creators with **analytics dashboards** for engagement tracking.
* Enable **treasury pools and DAO governance**.

---

## 🤝 Contributing

We welcome contributions from developers, designers, and blockchain enthusiasts. Submit a PR or open an issue to join the Pulse movement.

---

## 📜 License

MIT © Pulse Team
