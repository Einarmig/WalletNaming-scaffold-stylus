import { formatUnits } from "viem";
import { useScaffoldReadContract } from "./useScaffoldReadContract";
import type { UseScaffoldReadConfig } from "~~/utils/scaffold-eth/contract";

interface UseTokenBalanceOptions {
  watch?: boolean; // Auto-update on new blocks
}

interface TokenBalanceData {
  balance: bigint | undefined;
  formatted: string;
  formattedWithSymbol: string;
  decimals: number;
  symbol: string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Reusable hook to read ERC20 token balance
 * Used in both set-name page (transfer validation) and balances page (display)
 *
 * @param tokenContractName - Name of the token contract in externalContracts (e.g., "ARB_Token", "WETH", "WBTC")
 * @param ownerAddress - Address to check balance for (accepts both string and 0x${string})
 * @param options - Configuration options
 * @returns TokenBalanceData with balance information and utility functions
 */
export function useTokenBalance(
  tokenContractName: string,
  ownerAddress: string | undefined,
  options: UseTokenBalanceOptions = { watch: true },
): TokenBalanceData {
  // Skip if no contract name or no owner address
  const enabled = !!tokenContractName && !!ownerAddress;

  // Convert address to proper type for Viem/Wagmi
  const formattedAddress = ownerAddress as `0x${string}` | undefined;

  // Read balance
  const {
    data: balance,
    isPending: isLoadingBalance,
    isError: isErrorBalance,
    refetch: refetchBalance,
  } = useScaffoldReadContract({
    contractName: tokenContractName,
    functionName: "balanceOf",
    args: [formattedAddress],
    watch: options.watch,
    enabled,
  } as any);

  // Read decimals
  const { data: decimals } = useScaffoldReadContract({
    contractName: tokenContractName,
    functionName: "decimals",
    watch: false, // Decimals don't change
    enabled,
  } as any);

  // Read symbol
  const { data: symbol } = useScaffoldReadContract({
    contractName: tokenContractName,
    functionName: "symbol",
    watch: false, // Symbol doesn't change
    enabled,
  } as any);

  const decimalsNum = decimals ? Number(decimals) : 18;
  const symbolStr = (symbol as unknown as string) || "";

  // Debug logging (remove after testing)
  if (process.env.NODE_ENV === "development") {
    console.log("useTokenBalance:", {
      contractName: tokenContractName,
      ownerAddress: formattedAddress,
      balance: balance?.toString(),
      decimals: decimalsNum,
      symbol: symbolStr,
      isLoading: isLoadingBalance,
      isError: isErrorBalance,
    });
  }

  const formatted = balance ? formatUnits(balance as unknown as bigint, decimalsNum) : "0.00";

  // Format to 2 decimal places for display (except if very small amount)
  const formattedDisplay = parseFloat(formatted).toFixed(
    decimalsNum === 8 ? 8 : 2, // BTC uses 8 decimals
  );

  return {
    balance: balance as bigint | undefined,
    formatted: formattedDisplay,
    formattedWithSymbol: `${formattedDisplay} ${symbolStr}`,
    decimals: decimalsNum,
    symbol: symbolStr,
    isLoading: isLoadingBalance,
    isError: isErrorBalance,
    refetch: refetchBalance,
  };
}
