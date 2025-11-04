"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { isAddress, parseUnits } from "viem";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import { InputBase } from "~~/components/scaffold-eth/Input/InputBase";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTokenBalance } from "~~/hooks/scaffold-eth/useTokenBalance";
import { useTokenApproval } from "~~/hooks/scaffold-eth/useTokenApproval";
import { SUPPORTED_TOKENS, TOKEN_SYMBOLS, type TokenSymbol } from "~~/types/tokens";

const SetNamePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [nameInput, setNameInput] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddressInput, setRecipientAddressInput] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>("ARB");
  const [inputMode, setInputMode] = useState<"alias" | "address">("alias");
  const [isChangingName, setIsChangingName] = useState(false);

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

  // Resolve recipient address from name (only in alias mode)
  const { data: resolvedAddress } = useScaffoldReadContract({
    contractName: "wallet_naming",
    functionName: "getAddressByName",
    args: [recipientName || ""],
  });

  // Determine final recipient address based on mode
  const recipientAddress =
    inputMode === "alias"
      ? resolvedAddress
      : isAddress(recipientAddressInput)
        ? (recipientAddressInput as `0x${string}`)
        : undefined;

  // Token configuration
  const tokenConfig = SUPPORTED_TOKENS[selectedToken];

  // ETH native balance
  const { data: ethBalanceData, isLoading: isLoadingEthBalance } = useBalance({
    address: connectedAddress,
  });

  // ERC20 token balance (for ARB)
  const {
    balance: arbBalance,
    formatted: arbBalanceFormatted,
    isLoading: isLoadingArbBalance,
  } = useTokenBalance(tokenConfig.isNative ? "" : tokenConfig.contractName!, connectedAddress, { watch: true });

  // Determine which balance to use
  const balance = tokenConfig.isNative ? ethBalanceData?.value : arbBalance;
  const balanceFormatted = tokenConfig.isNative ? ethBalanceData?.formatted || "0.00" : arbBalanceFormatted;
  const isLoadingBalance = tokenConfig.isNative ? isLoadingEthBalance : isLoadingArbBalance;

  // Token approval (only for ERC20 tokens like ARB)
  const { isApproved, approve, isApproving } = useTokenApproval(
    tokenConfig.isNative ? "" : tokenConfig.contractName!,
    connectedAddress,
    recipientAddress,
  );

  // Native ETH transfer hook
  const { sendTransaction: sendEth, isPending: isSendingEth } = useSendTransaction();

  // Write contracts
  const { writeContractAsync: setName, isMining: isSettingName } = useScaffoldWriteContract("wallet_naming");
  const { writeContractAsync: releaseName, isMining: isReleasingName } = useScaffoldWriteContract("wallet_naming");
  const { writeContractAsync: transferArbToken, isMining: isTransferringERC20 } = useScaffoldWriteContract("ARB_Token");

  const hasName = currentName && currentName !== "";

  // Parse transfer amount to bigint
  const transferAmountBigInt = transferAmount ? parseUnits(transferAmount, tokenConfig.decimals) : BigInt(0);

  // Check if balance is sufficient
  const hasSufficientBalance = balance ? balance >= transferAmountBigInt : false;

  // Check if approval is needed (only for ERC20 tokens, not for native ETH)
  const needsApproval = !tokenConfig.isNative && transferAmountBigInt > 0 && !isApproved(transferAmountBigInt);

  // Check if transfer is in progress
  const isTransferring = tokenConfig.isNative ? isSendingEth : isTransferringERC20;

  const handleSetName = async () => {
    if (!nameInput || !isNameAvailable) return;

    try {
      await setName({
        functionName: "setName",
        args: [nameInput],
      });
      setNameInput("");
      setIsChangingName(false);
    } catch (error) {
      console.error("Error setting name:", error);
    }
  };

  const handleReleaseName = async () => {
    try {
      await releaseName({
        functionName: "releaseName",
      });
    } catch (error) {
      console.error("Error releasing name:", error);
    }
  };

  const handleApprove = async () => {
    if (!transferAmountBigInt || transferAmountBigInt === BigInt(0)) return;

    try {
      await approve(transferAmountBigInt);
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  const handleTransfer = async () => {
    if (!recipientAddress || !transferAmountBigInt || transferAmountBigInt === BigInt(0)) return;

    try {
      if (tokenConfig.isNative) {
        // Native ETH transfer
        await sendEth({
          to: recipientAddress,
          value: transferAmountBigInt,
        });
      } else {
        // ERC20 token transfer (ARB)
        await transferArbToken({
          functionName: "transfer",
          args: [recipientAddress, transferAmountBigInt],
        });
      }
      setTransferAmount("");
      setRecipientName("");
      setRecipientAddressInput("");
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
          {hasName && !isChangingName && (
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#3283EB] to-[#E3066E] text-white text-sm font-semibold">
              {currentName}
            </span>
          )}
        </div>

        {/* NAME or MANAGE NAME Section */}
        <div className="mb-12 relative rounded-2xl p-[2px] bg-gradient-to-r from-[#3283EB] to-[#E3066E] shadow-lg transition-all duration-300">
          <div className="bg-base-100 rounded-2xl p-6 backdrop-blur-md">
            {!hasName || isChangingName ? (
              <>
                {/* Original NAME section */}
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
                  {isChangingName && (
                    <button
                      className="btn btn-ghost uppercase"
                      onClick={() => {
                        setIsChangingName(false);
                        setNameInput("");
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* MANAGE NAME section */}
                <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60 mb-4">MANAGE NAME</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base-content/60 text-sm mb-1">Your current name:</p>
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#3283EB] to-[#E3066E] text-white text-sm font-semibold">
                        {currentName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      className="btn border-0 font-semibold whitespace-nowrap uppercase flex-1"
                      style={{
                        background: "linear-gradient(180deg, #3283EB 0%, #1a5bb8 100%)",
                        boxShadow: "0 2px 0 #6ba3eb, 0 4px 8px rgba(107, 163, 235, 0.3)",
                        color: "#ffffff",
                      }}
                      onClick={() => setIsChangingName(true)}
                    >
                      Change Name
                    </button>
                    <button
                      className="btn border-0 font-semibold whitespace-nowrap uppercase flex-1"
                      style={{
                        background: "linear-gradient(180deg, #fc3592 0%, #e3066e 100%)",
                        boxShadow: "0 2px 0 #ff9ccb, 0 4px 8px rgba(255, 156, 203, 0.3)",
                        color: "#ffffff",
                      }}
                      onClick={handleReleaseName}
                      disabled={isReleasingName}
                    >
                      {isReleasingName ? <span className="loading loading-spinner"></span> : "Release Name"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TRANSFER Section */}
        <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-[#3283EB] to-[#E3066E] shadow-lg">
          <div className="bg-base-100 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">TRANSFER</h2>
              {/* Token Selector */}
              <div className="flex items-center gap-2">
                <select
                  className="select select-sm bg-base-200 border-base-300 font-semibold"
                  value={selectedToken}
                  onChange={e => setSelectedToken(e.target.value as TokenSymbol)}
                >
                  {TOKEN_SYMBOLS.map(symbol => {
                    const token = SUPPORTED_TOKENS[symbol];
                    return (
                      <option key={symbol} value={symbol}>
                        {token.icon} {symbol}
                      </option>
                    );
                  })}
                </select>
                <div className="text-xs text-base-content/60">
                  Balance: {isLoadingBalance ? "..." : balanceFormatted}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {/* Recipient Input with Toggle */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-base-content/60">Recipient:</span>
                  {/* Toggle Switch */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-xs ${inputMode === "alias" ? "font-semibold" : "text-base-content/40"}`}>
                      By Alias
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-sm toggle-primary"
                      checked={inputMode === "address"}
                      onChange={() => {
                        setInputMode(inputMode === "alias" ? "address" : "alias");
                        setRecipientName("");
                        setRecipientAddressInput("");
                      }}
                    />
                    <span className={`text-xs ${inputMode === "address" ? "font-semibold" : "text-base-content/40"}`}>
                      By Address
                    </span>
                  </label>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    {inputMode === "alias" ? (
                      <>
                        <InputBase value={recipientName} onChange={setRecipientName} placeholder="Recipient alias" />
                        {recipientAddress && recipientAddress !== "0x0000000000000000000000000000000000000000" && (
                          <p className="text-xs text-success mt-2">
                            ✓ {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                          </p>
                        )}
                        {recipientName &&
                          (!recipientAddress || recipientAddress === "0x0000000000000000000000000000000000000000") && (
                            <p className="text-xs text-error mt-2">✗ Name not found</p>
                          )}
                      </>
                    ) : (
                      <>
                        <InputBase
                          value={recipientAddressInput}
                          onChange={setRecipientAddressInput}
                          placeholder="0x..."
                        />
                        {recipientAddressInput && !isAddress(recipientAddressInput) && (
                          <p className="text-xs text-error mt-2">✗ Invalid address</p>
                        )}
                        {recipientAddressInput && isAddress(recipientAddressInput) && (
                          <p className="text-xs text-success mt-2">✓ Valid address</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Input and Action Buttons */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <InputBase value={transferAmount} onChange={setTransferAmount} placeholder="Amount" />
                  {transferAmount && !hasSufficientBalance && (
                    <p className="text-xs text-error mt-2">✗ Insufficient balance</p>
                  )}
                </div>

                {/* Approve Button (if needed) */}
                {needsApproval && (
                  <button
                    className="btn border-0 font-semibold whitespace-nowrap uppercase"
                    style={{
                      background: "linear-gradient(180deg, #3283EB 0%, #1a5bb8 100%)",
                      boxShadow: "0 2px 0 #6ba3eb, 0 4px 8px rgba(107, 163, 235, 0.3)",
                      minWidth: "120px",
                      color: "#ffffff",
                    }}
                    onClick={handleApprove}
                    disabled={isApproving || !hasSufficientBalance}
                  >
                    {isApproving ? <span className="loading loading-spinner"></span> : `APPROVE ${selectedToken}`}
                  </button>
                )}

                {/* Send Button */}
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
                    !recipientAddress ||
                    !transferAmount ||
                    !hasSufficientBalance ||
                    needsApproval ||
                    isTransferring ||
                    transferAmountBigInt === BigInt(0) ||
                    recipientAddress === "0x0000000000000000000000000000000000000000"
                  }
                >
                  {isTransferring ? <span className="loading loading-spinner"></span> : "SEND"}
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
