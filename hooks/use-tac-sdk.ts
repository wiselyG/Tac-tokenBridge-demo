"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { TacSdk, SenderFactory, type EvmProxyMsg, type AssetBridgingData, type TransactionLinker } from '@tonappchain/sdk';
import { tacSdkService } from '@/lib/tac-sdk';

export interface CrossChainTransactionState {
  isLoading: boolean;
  error: string | null;
  transactionLinker: TransactionLinker | null;
}

export function useTacSdk() {
  const [tonConnectUI] = useTonConnectUI();
  const [sdk, setSdk] = useState<TacSdk | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  const [transactionState, setTransactionState] = useState<CrossChainTransactionState>({
    isLoading: false,
    error: null,
    transactionLinker: null,
  });

  const initializeSdk = useCallback(async () => {
    if (sdk || isInitializing) return;

    setIsInitializing(true);
    setInitError(null);

    try {
      const initializedSdk = await tacSdkService.initialize();
      setSdk(initializedSdk);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize TAC SDK';
      setInitError(errorMessage);
      console.error('TAC SDK initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [sdk, isInitializing]);

  const sendCrossChainTransaction = useCallback(async (
    evmProxyMsg: EvmProxyMsg,
    assets?: AssetBridgingData[]
  ): Promise<TransactionLinker | null> => {
    if (!sdk) {
      throw new Error('TAC SDK not initialized');
    }

    if (!tonConnectUI.connected) {
      throw new Error('TON wallet not connected');
    }

    setTransactionState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      transactionLinker: null,
    }));

    try {
      const sender = await SenderFactory.getSender({
        tonConnect: tonConnectUI
      });

      const transactionLinker = await sdk.sendCrossChainTransaction(
        evmProxyMsg,
        sender,
        assets || []
      );

      setTransactionState(prev => ({
        ...prev,
        isLoading: false,
        transactionLinker,
      }));

      return transactionLinker;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setTransactionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [sdk, tonConnectUI]);

  const clearTransactionState = useCallback(() => {
    setTransactionState({
      isLoading: false,
      error: null,
      transactionLinker: null,
    });
  }, []);

  useEffect(() => {
    initializeSdk();
    
    return () => {
      tacSdkService.cleanup();
    };
  }, [initializeSdk]);

  return {
    sdk,
    isInitializing,
    initError,
    isReady: !!sdk && !isInitializing && !initError,
    sendCrossChainTransaction,
    transactionState,
    clearTransactionState,
  };
}