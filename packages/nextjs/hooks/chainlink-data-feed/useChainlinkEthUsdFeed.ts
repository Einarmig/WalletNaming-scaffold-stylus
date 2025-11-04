import { useScaffoldReadContract } from "../scaffold-eth";

export default function useChainlinkEthUsdFeed() {
  const { data, isPending, refetch } = useScaffoldReadContract({
    contractName: "Chainlink_ETH_USD_DataFeed",
    functionName: "latestRoundData",
  });

  const [roundId, answer, startedAt, updatedAt, answeredInRound] = data ?? [];

  return { data: { roundId, answer, startedAt, updatedAt, answeredInRound }, isPending, refetch };
}
