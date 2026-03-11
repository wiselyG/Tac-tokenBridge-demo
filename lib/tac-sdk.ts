"use client";

import { TacSdk, Network, type SDKParams } from '@tonappchain/sdk';

class TacSdkService {
  private static instance: TacSdkService;
  private sdk: TacSdk | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TacSdkService {
    if (!TacSdkService.instance) {
      TacSdkService.instance = new TacSdkService();
    }
    return TacSdkService.instance;
  }

  async initialize(): Promise<TacSdk> {
    if (this.isInitialized && this.sdk) {
      return this.sdk;
    }

    try {
      const sdkParams: SDKParams = {
        network: Network.TESTNET
      };
      
      this.sdk = await TacSdk.create(sdkParams);
      this.isInitialized = true;
      
      return this.sdk;
    } catch (error) {
      console.error('Failed to initialize TAC SDK:', error);
      throw new Error('Failed to initialize TAC SDK');
    }
  }

  getSdk(): TacSdk | null {
    return this.sdk;
  }

  isReady(): boolean {
    return this.isInitialized && this.sdk !== null;
  }

  async cleanup(): Promise<void> {
    if (this.sdk) {
      try {
        this.sdk.closeConnections();
      } catch (error) {
        console.error('Error closing TAC SDK connections:', error);
      }
      this.sdk = null;
      this.isInitialized = false;
    }
  }
}

export const tacSdkService = TacSdkService.getInstance();