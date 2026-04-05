import { useState, useCallback, useMemo } from "react";
import { Blockchain } from "@/lib/blockchain";

const blockchainInstance = new Blockchain();

export function useBlockchain() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    blockchainInstance.reload();
    setVersion((v) => v + 1);
  }, []);

  const blockchain = useMemo(() => blockchainInstance, []);
  // Access chain through version to trigger re-renders
  const chain = useMemo(() => blockchain.chain, [version, blockchain]);
  const stats = useMemo(() => blockchain.getStats(), [version, blockchain]);

  const addTransaction = useCallback(
    (tx: Parameters<Blockchain["addTransaction"]>[0]) => {
      const block = blockchain.addTransaction(tx);
      setVersion((v) => v + 1);
      return block;
    },
    [blockchain]
  );

  const tamperBlock = useCallback(
    (index: number, field: string, value: string) => {
      blockchain.tamperBlock(index, field, value);
      setVersion((v) => v + 1);
    },
    [blockchain]
  );

  const validateChain = useCallback(() => {
    blockchain.reload();
    return blockchain.validateChain();
  }, [blockchain]);

  const reset = useCallback(() => {
    blockchain.reset();
    setVersion((v) => v + 1);
  }, [blockchain]);

  const getPatientHistory = useCallback(
    (patientId: string) => blockchain.getPatientHistory(patientId),
    [version, blockchain]
  );

  return {
    chain,
    stats,
    addTransaction,
    tamperBlock,
    validateChain,
    reset,
    refresh,
    getPatientHistory,
  };
}
