"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth/Input/InputBase";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const SetNamePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [nameInput, setNameInput] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Read user's current name
  const { data: currentName } = useScaffoldReadContract({
    contractName: "wallet_naming",
    functionName: "getName",
    args: [connectedAddress],
  });

  // Check if name is available
  const { data: isNameAvailable } = useScaffoldReadContract({
    contractName: "wallet_naming",
    functionName: "isNameAvailable",
    args: [nameInput],
  });

  // Resolve recipient address from name
  const { data: recipientAddress } = useScaffoldReadContract({
    contractName: "wallet_naming",
    functionName: "getAddressByName",
    args: [recipientName],
  });

  // Write contracts
  const { writeContractAsync: setName, isMining: isSettingName } = useScaffoldWriteContract({
    contractName: "wallet_naming",
  });

  const hasName = currentName && currentName !== "";

  const handleSetName = async () => {
    if (!nameInput || !isNameAvailable) return;

    try {
      await setName({
        functionName: "setName",
        args: [nameInput],
      });
      setNameInput("");
    } catch (error) {
      console.error("Error setting name:", error);
    }
  };

  const handleTransfer = async () => {
    if (!recipientName || !transferAmount || !recipientAddress) return;

    try {
      // TODO: Implement ERC20 transfer logic
      // This would require the ERC20 contract address and ABI
      console.log("Transfer to:", recipientAddress, "Amount:", transferAmount);
    } catch (error) {
      console.error("Error transferring:", error);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10 px-5">
      <div className="w-full max-w-4xl">
        {/* Centered Header with Address and Alias */}
        <div className="flex flex-col items-center gap-2 mb-16">
          <span className="font-mono text-base-content text-lg">{connectedAddress}</span>
          {hasName && (
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#3283EB] to-[#E3066E] text-white text-sm font-semibold">
              {currentName}
            </span>
          )}
        </div>

        {/* NAME Section */}
        <div className="mb-12 relative rounded-2xl p-[2px] bg-gradient-to-r from-[#3283EB] to-[#E3066E] shadow-lg">
          <div className="bg-base-100 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60 mb-4">NAME</h2>
            <div className="flex items-start gap-4">
              <div className="flex-1 relative">
                <InputBase
                  value={nameInput}
                  onChange={setNameInput}
                  placeholder="Enter name"
                  disabled={isSettingName}
                />
                {nameInput && (
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                      isNameAvailable ? "text-success" : "text-error"
                    }`}
                  >
                    {isNameAvailable ? "✓" : "✗"}
                  </span>
                )}
              </div>
              <button
                className="btn border-0 font-semibold whitespace-nowrap uppercase"
                style={{
                  background: "linear-gradient(180deg, #fc3592 0%, #e3066e 100%)",
                  boxShadow: "0 2px 0 #ff9ccb, 0 4px 8px rgba(255, 156, 203, 0.3)",
                  minWidth: "120px",
                  color: "#ffffff",
                }}
                onClick={handleSetName}
                disabled={!nameInput || !isNameAvailable || isSettingName}
              >
                {isSettingName ? <span className="loading loading-spinner"></span> : "SET"}
              </button>
            </div>
          </div>
        </div>

        {/* TRANSFER Section */}
        <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-[#3283EB] to-[#E3066E] shadow-lg">
          <div className="bg-base-100 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60 mb-4">TRANSFER</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <InputBase value={recipientName} onChange={setRecipientName} placeholder="Recipient alias" />
                  {recipientAddress && recipientAddress !== "0x0000000000000000000000000000000000000000" && (
                    <p className="text-xs text-success mt-2">
                      ✓ {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                    </p>
                  )}
                  {recipientName && recipientAddress === "0x0000000000000000000000000000000000000000" && (
                    <p className="text-xs text-error mt-2">✗ Name not found</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <InputBase value={transferAmount} onChange={setTransferAmount} placeholder="Amount" />
                </div>
                <button
                  className="btn border-0 font-semibold whitespace-nowrap uppercase"
                  style={{
                    background: "linear-gradient(180deg, #fc3592 0%, #e3066e 100%)",
                    boxShadow: "0 2px 0 #ff9ccb, 0 4px 8px rgba(255, 156, 203, 0.3)",
                    minWidth: "120px",
                    color: "#ffffff",
                  }}
                  onClick={handleTransfer}
                  disabled={
                    !recipientName ||
                    !transferAmount ||
                    !recipientAddress ||
                    recipientAddress === "0x0000000000000000000000000000000000000000"
                  }
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetNamePage;
