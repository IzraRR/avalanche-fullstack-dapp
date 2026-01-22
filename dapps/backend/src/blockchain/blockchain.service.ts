import { Injectable, InternalServerErrorException, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { createPublicClient, http, isAddress } from 'viem';
import { avalancheFuji } from 'viem/chains';
import SIMPLE_STORAGE from './simple-storage.json';

@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;
  private readonly MAX_BLOCK_RANGE = 2048;
  private readonly RPC_TIMEOUT = 10_000;

  constructor() {
    // Validate contract address format
    const contractAddressFromEnv = process.env.CONTRACT_ADDRESS;
    if (!contractAddressFromEnv || !isAddress(contractAddressFromEnv)) {
      throw new Error('Invalid or missing CONTRACT_ADDRESS in environment variables');
    }

    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.RPC_URL, {
        timeout: this.RPC_TIMEOUT,
      }),
    });

    this.contractAddress = contractAddressFromEnv as `0x${string}`;
  }

  // 🔹 Read latest value
  async getLatestValue() {
    try {
      const value = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE.abi,
        functionName: 'getValue',
      });

      return {
        value: value.toString(),
      };
    } catch (error: any) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Read ValueUpdated events with validation
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    try {
      // Validate input
      if (!Number.isInteger(fromBlock) || !Number.isInteger(toBlock)) {
        throw new BadRequestException('fromBlock and toBlock must be integers');
      }

      if (fromBlock < 0 || toBlock < 0) {
        throw new BadRequestException('Block numbers cannot be negative');
      }

      if (toBlock < fromBlock) {
        throw new BadRequestException('toBlock must be greater than or equal to fromBlock');
      }

      const blockRange = toBlock - fromBlock;
      if (blockRange > this.MAX_BLOCK_RANGE) {
        throw new BadRequestException(
          `Block range (${blockRange}) exceeds maximum allowed (${this.MAX_BLOCK_RANGE}). Please request a smaller range.`
        );
      }

      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: 'event',
          name: 'ValueUpdated',
          inputs: [
            {
              name: 'newValue',
              type: 'uint256',
              indexed: false,
            },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      return events.map((event) => ({
        blockNumber: event.blockNumber?.toString(),
        value: event.args.newValue.toString(),
        txHash: event.transactionHash,
      }));
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.handleRpcError(error);
    }
  }

  // 🔹 Centralized RPC Error Handler
  private handleRpcError(error: any): never {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('timeout')) {
      throw new ServiceUnavailableException(
        'RPC timeout. Please try again later.'
      );
    }

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed')
    ) {
      throw new ServiceUnavailableException(
        'Unable to connect to blockchain RPC.'
      );
    }

    throw new InternalServerErrorException(
      'An error occurred while reading blockchain data.'
    );
  }
}