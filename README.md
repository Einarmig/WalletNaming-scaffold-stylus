# 🏷️ Wallet Naming Service

A decentralized wallet naming system built with **Arbitrum Stylus** (Rust smart contracts) and **Next.js**. Set human-readable names for your wallet and transfer tokens by alias instead of addresses.


---

## 🚀 Live Deployment

- **Smart Contract**: [`0x335a80144cee8091c13bf1f8604c10c11942354c`](https://sepolia.arbiscan.io/address/0x335a80144cee8091c13bf1f8604c10c11942354c) (Arbitrum Sepolia)
- **Frontend**: https://namingservice.vercel.app
- **Test ARB Token**: [`0x298E5Bc60D62Ade42aDf1dA28Df522278014b15C`](https://sepolia.arbiscan.io/address/0x298E5Bc60D62Ade42aDf1dA28Df522278014b15C) (Arbitrum Sepolia)

---

## 🎯 Technical Approach

### Key Decisions



**1. Bidirectional Mapping Architecture**
- Implemented `HashMap<Address, String>` and `HashMap<String, Address>`
- Ensures O(1) lookups for both name→address and address→name queries
- Name uniqueness enforced at contract level

**2. ERC20 Approval Flow**
- Custom `useTokenApproval` hook manages approval state
- Prevents transaction failures by checking allowances first
- Auto-detects when approval is needed

**3. Real-Time Price Integration**
- Chainlink Data Feeds for ARB/USD and ETH/USD
- `useChainlinkBtcUsdFeed` and `useChainlinkEthUsdFeed` custom hooks
- Displays token balances with live USD valuations

**4. Access Control via Name Ownership**
- Balance dashboard only accessible after setting a wallet name
- Encourages user registration before full feature access
- Enhances UX by creating a personalized experience

---

## ✨ Core Features

- **Name Registry**: Register unique wallet names (stored on-chain in Rust)
- **Alias Transfers**: Send ARB/ETH tokens using names instead of addresses
- **Dual Input Mode**: Toggle between alias-based and address-based transfers
- **Balance Dashboard**: View token holdings with live USD prices (Chainlink)
- **Name Management**: Change or release your registered name
- **Responsive UI**: Mobile-friendly with gradient design system


## 📂 Project Structure

```
packages/
├── stylus/wallet_naming/
│   └── src/lib.rs           # Rust contract: name mapping logic
│
└── nextjs/
    ├── app/
    │   ├── page.tsx         # Landing page
    │   ├── set-name/        # Name registration + token transfer
    │   └── balances/        # Balance dashboard (Chainlink prices)
    │
    ├── hooks/
    │   ├── scaffold-eth/
    │   │   ├── useTokenBalance.ts     # ERC20 balance hook
    │   │   └── useTokenApproval.ts    # Approval management
    │   └── chainlink-data-feed/
    │       ├── useChainlinkEthUsdFeed.ts
    │       └── useChainlinkBtcUsdFeed.ts
    │
    └── contracts/
        ├── deployedContracts.ts       # wallet_naming ABI
        └── externalContracts.ts       # ARB token, Chainlink feeds
```

---

## 🦀 Smart Contract API

**Location**: `/packages/stylus/wallet_naming/src/lib.rs`

```rust
// Register or update wallet name
pub fn set_name(&mut self, name: String) -> Result<(), Vec<u8>>

// Get name for address
pub fn get_name(&self, user: Address) -> Result<String, Vec<u8>>

// Resolve name to address
pub fn get_address_by_name(&self, name: String) -> Result<Address, Vec<u8>>

// Check name availability
pub fn is_name_available(&self, name: String) -> Result<bool, Vec<u8>>

// Release current name
pub fn release_name(&mut self) -> Result<(), Vec<u8>>
```

**Events**: `NameRegistered`, `NameChanged`

---

## 📝 Development Notes

- Built on [Scaffold-Stylus](https://github.com/Scaffold-Stylus/scaffold-stylus) framework
- ARB token is a custom ERC20 for testing (NOT official ARB)
- Chainlink feeds deployed at Arbitrum Sepolia addresses
- Design system uses blue-pink gradient (`#3283EB` → `#E3066E`)
