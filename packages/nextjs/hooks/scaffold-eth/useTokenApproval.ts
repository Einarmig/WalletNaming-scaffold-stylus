import { useScaffoldReadContract, useScaffoldWriteContract } from "./";
import type { UseScaffoldReadConfig, UseScaffoldWriteConfig } from "~~/utils/scaffold-eth/contract";

interface UseTokenApprovalReturn {
  allowance: bigint | undefined;
  isApproved: (amount: bigint) => boolean;
  approve: (amount: bigint) => Promise<void>;
  isApproving: boolean;
  checkAllowance: () => void;
}

/**
 * Hook to manage ERC20 token approvals
 * Checks current allowance and provides approve function
 *
 * @param tokenContractName - Name of the token contract (e.g., "ARB_Token", "WETH")
 * @param ownerAddress - Address of the token owner (accepts both string and 0x${string})
 * @param spenderAddress - Address that will spend the tokens (accepts both string and 0x${string})
 * @returns Allowance data and approve function
 */
export function useTokenApproval(
  tokenContractName: string,
  ownerAddress: string | undefined,
  spenderAddress: string | undefined,
): UseTokenApprovalReturn {
  // Convert addresses to proper type for Viem/Wagmi
  const formattedOwner = ownerAddress as `0x${string}` | undefined;
  const formattedSpender = spenderAddress as `0x${string}` | undefined;

  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: tokenContractName,
    functionName: "allowance",
    args: [formattedOwner, formattedSpender],
    watch: true,
  } as any);

  // Write contract for approve
  const { writeContractAsync, isMining } = useScaffoldWriteContract(tokenContractName as any) as any;

  /**
   * Check if the current allowance is sufficient for a given amount
   */
  const isApproved = (amount: bigint): boolean => {
    if (!allowance) return false;
    return (allowance as unknown as bigint) >= amount;
  };

  /**
   * Approve tokens for spending
   */
  const approve = async (amount: bigint): Promise<void> => {
    if (!formattedSpender) {
      throw new Error("Spender address is required");
    }

    try {
      await writeContractAsync(
        {
          functionName: "approve",
          args: [formattedSpender, amount],
        },
        {
          onBlockConfirmation: (txnReceipt: any) => {
            console.log("Approval confirmed:", txnReceipt.blockHash);
            // Refetch allowance after approval
            refetchAllowance();
          },
        },
      );
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  };

  return {
    allowance: allowance as bigint | undefined,
    isApproved,
    approve,
    isApproving: isMining,
    checkAllowance: refetchAllowance,
  };
}
