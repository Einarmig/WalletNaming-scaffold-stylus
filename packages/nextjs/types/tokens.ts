/**
 * Token types and configuration for multi-token support
 * Simplified to support only ARB (ERC20) and ETH (native)
 */

export type TokenSymbol = "ARB" | "ETH";

export interface TokenConfig {
  symbol: TokenSymbol;
  name: string;
  contractName?: string; // Optional - not needed for native ETH
  decimals: number;
  icon: string; // Emoji or icon identifier
  isNative: boolean; // True for native ETH, false for ERC20 tokens
}

export const SUPPORTED_TOKENS: Record<TokenSymbol, TokenConfig> = {
  ARB: {
    symbol: "ARB",
    name: "Arbitrum",
    contractName: "ARB_Token",
    decimals: 18,
    icon: "🔷",
    isNative: false,
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    contractName: undefined, // Native token, no contract
    decimals: 18,
    icon: "Ξ",
    isNative: true,
  },
};

export const TOKEN_SYMBOLS: TokenSymbol[] = ["ARB", "ETH"];
