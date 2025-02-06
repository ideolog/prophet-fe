# Prophet Frontend

This is the frontend for **Prophet**, a decentralized platform where users can create, refine, and trade narrative claims. The platform integrates with crypto wallets for seamless user interactions and utilizes smart contract logic for transparent and immutable transactions.

## Live Project
TBD

## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [License](#license)

## Tech Stack
- **Next.js** – Framework for server-rendered React applications
- **TypeScript** – Static typing for JavaScript
- **Tailwind CSS** – Utility-first CSS framework
- **Solana Phantom Wallet Integration** – Crypto wallet connection for transactions
- **REST API** – Backend communication

## Project Structure
```
.
├── src
│   ├── app
│   │   ├── claims                # Claim Detail Pages
│   │   ├── create-claim          # Page for Creating New Claims
│   │   ├── markets               # List of Active Markets
│   │   └── layout.tsx            # Main Application Layout
│   ├── components                # Reusable UI Components
│   │   ├── ClaimList.tsx
│   │   ├── PhantomWalletConnect.tsx
│   │   └── ProphetNavigation.tsx
│   ├── once-ui                   # Custom UI Library
│   ├── semantic                  # Claim Validation Logic
│   └── styles                    # Global Styles and Tokens
├── public                        # Static Assets
├── package.json                  # Project Dependencies
└── tsconfig.json                 # TypeScript Configuration
```

## Key Features
- **Claim Creation & Refinement**: Users submit claims that are refined using AI suggestions.
- **Market Trading**: Buy TRUE/FALSE shares in claims using SOL, following bonding curve logic for dynamic pricing.
- **Phantom Wallet Integration**: Connect your Solana wallet to interact with the platform.
- **Dynamic Pricing**: Prices adjust based on market demand using a bonding curve model.

## Getting Started

### Prerequisites
- Node.js (v16+)
- Yarn or npm

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/ideolog/prophet-fe.git
   cd prophet-fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Visit:** [http://localhost:3000](http://localhost:3000)

## License
This project is licensed by **crowdprophet.io**.
