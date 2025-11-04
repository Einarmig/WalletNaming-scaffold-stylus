"use client";

import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { PriceCard } from "~~/components/PriceCard";
import { Address } from "~~/components/scaffold-eth";
import useChainlinkArbUsdFeed from "~~/hooks/chainlink-data-feed/useChainlinkArbUsdFeed";
import useChainlinkEthUsdFeed from "~~/hooks/chainlink-data-feed/useChainlinkEthUsdFeed";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTokenBalance } from "~~/hooks/scaffold-eth/useTokenBalance";
import { SUPPORTED_TOKENS } from "~~/types/tokens";

const BalancesPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const router = useRouter();

  // Read user's current name
  const { data: currentName } = useScaffoldReadContract({
    contractName: "wallet_naming",
    functionName: "getName",
    args: [connectedAddress],
  });

  // Price feeds
  const { data: arbData, isPending: arbLoading } = useChainlinkArbUsdFeed();
  const { data: ethData, isPending: ethLoading } = useChainlinkEthUsdFeed();

  // Real token balances
  const arbBalance = useTokenBalance(SUPPORTED_TOKENS.ARB.contractName!, connectedAddress, { watch: true });

  // Native ETH balance
  const { data: ethBalanceData, isLoading: isLoadingEthBalance } = useBalance({
    address: connectedAddress,
  });

  const hasName = currentName && currentName !== "";

  const formatPrice = (answer: bigint | undefined, decimals = 8) => {
    if (!answer) return "0.00";
    return Number(formatUnits(answer, decimals)).toFixed(2);
  };

  if (!connectedAddress) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10 px-5">
        <div className="w-full max-w-6xl text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#3283EB] to-[#E3066E] bg-clip-text text-transparent">
            Balances
          </h1>
          <p className="text-lg text-base-content/70">Please connect your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10 px-5 relative">
      {/* Modal Overlay when user doesn't have a name */}
      {!hasName && currentName !== undefined && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-[#3283EB] to-[#E3066E] max-w-md w-full animate-in fade-in duration-300">
            <div className="bg-base-100 rounded-2xl p-8 backdrop-blur-md">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#3283EB] to-[#E3066E] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-[#3283EB] to-[#E3066E] bg-clip-text text-transparent">
                Name Required
              </h2>

              {/* Message */}
              <p className="text-center text-base-content/70 mb-8 text-lg">
                You need to set a name for your wallet before you can view your balances.
              </p>

              {/* Button */}
              <button
                className="btn border-0 text-white font-semibold w-full text-lg"
                style={{
                  background: "linear-gradient(180deg, #fc3592 0%, #e3066e 100%)",
                  boxShadow: "0 2px 0 #ff9ccb, 0 4px 8px rgba(255, 156, 203, 0.3)",
                }}
                onClick={() => router.push("/set-name")}
              >
                Set Name Now →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl">
        {/* Compact Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3283EB] to-[#E3066E] bg-clip-text text-transparent">
            Balances
          </h1>
          <div className="flex items-center gap-3">
            <Address address={connectedAddress} />
            {hasName && (
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#3283EB] to-[#E3066E] text-white text-sm font-semibold">
                {currentName}
              </span>
            )}
          </div>
        </div>

        {/* Price Cards with Real Balances - Only ARB and ETH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriceCard
            symbol="ARB"
            price={formatPrice(arbData.answer)}
            amount={arbBalance.formatted}
            totalUsd={(Number(formatPrice(arbData.answer)) * Number(arbBalance.formatted)).toFixed(2)}
            isLoading={arbLoading || arbBalance.isLoading}
          />
          <PriceCard
            symbol="ETH"
            price={formatPrice(ethData.answer)}
            amount={ethBalanceData?.formatted || "0.00"}
            totalUsd={(Number(formatPrice(ethData.answer)) * Number(ethBalanceData?.formatted || "0")).toFixed(2)}
            isLoading={ethLoading || isLoadingEthBalance}
          />
        </div>
      </div>
    </div>
  );
};

export default BalancesPage;
