"use client";

import type { NextPage } from "next";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { Card } from "~~/components/Card";
import { Address } from "~~/components/scaffold-eth";
import DarkBugAntIcon from "~~/icons/DarkBugAntIcon";
import LightBugAntIcon from "~~/icons/LightBugAntIcon";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <>
      <div className="flex items-center flex-col justify-between flex-grow pt-10">
        <div className="flex flex-col justify-center flex-grow">
          <div className="px-5">
            <h1 className="text-center">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">Wallet Naming Service</span>
            </h1>
            <div className="flex justify-center items-center space-x-2 my-4">
              <p className={`my-2 font-medium ${!isDarkMode ? "text-[#E3066E]" : ""}`}>Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
            <p className="text-center text-lg max-w-2xl mx-auto">
              A decentralized naming service that allows you to set a unique name for your wallet and transfer ERC20
              tokens by name. Track your token balances with real-time Chainlink price feeds.
            </p>

            {/* Informative Note */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="alert alert-info shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>
                  <strong>Note:</strong> You must set a name for your wallet first to unlock the balances page.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="h-auto mb-3 w-full py-11"
          style={{
            backgroundColor: isDarkMode ? "#050505" : "white",
          }}
        >
          <div className="flex justify-center items-center h-full gap-8 flex-col sm:flex-row px-5">
            {/* Set Name & Transfer Card */}
            <Link href="/set-name" className="w-full sm:w-auto">
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
                <div className="card-body items-center text-center">
                  <h2 className="card-title text-2xl mb-2">Set Name & Transfer</h2>
                  <p className="text-sm opacity-70">
                    Set a unique name for your wallet and transfer tokens by name instead of address
                  </p>
                </div>
              </div>
            </Link>

            {/* View Balances Card */}
            <Link href="/balances" className="w-full sm:w-auto">
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
                <div className="card-body items-center text-center">
                  <h2 className="card-title text-2xl mb-2">View Balances</h2>
                  <p className="text-sm opacity-70">
                    Track your token balances with real-time prices from Chainlink data feeds
                  </p>
                </div>
              </div>
            </Link>

            {/* Debug Contracts Card */}
            <Card
              icon={isDarkMode ? <DarkBugAntIcon /> : <LightBugAntIcon />}
              description={<>Tinker with your smart contract using the</>}
              linkHref="/debug"
              linkText="Debug Contracts"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
