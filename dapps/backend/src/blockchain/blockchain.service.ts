import { Injectable, InternalServerErrorException, ServiceUnavailableException } from "@nestjs/common";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import SIMPLE_STORAGE from "./simple-storage.json";

@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.RPC_URL, {
        timeout: 10_000, // 10 detik timeout
      }),
    });

    // GANTI dengan address hasil deploy Day 2
    this.contractAddress = (process.env.CONTRACT_ADDRESS as `0x${string}`);
  }

  // 🔹 Read latest value
  async getLatestValue() {
    try {
    const value = await this.client.readContract({
      address: this.contractAddress,
      abi: SIMPLE_STORAGE.abi,
      functionName: "getValue",
    });

    return {
      value: value.toString(),
    };
  } catch (error: any) {
    this.handleRpcError(error);
    }
  }

  // 🔹 Read ValueUpdated events
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    try {
    const MAX_BLOCK_RANGE = 2048;
    
    // Ensure toBlock is not less than fromBlock
    if (toBlock < fromBlock) {
      throw new Error("toBlock must be greater than or equal to fromBlock");
    }

    // Check if the range exceeds the maximum allowed
    const blockRange = toBlock - fromBlock;
    if (blockRange > MAX_BLOCK_RANGE) {
      throw new Error(
        `Block range (${blockRange}) exceeds maximum allowed (${MAX_BLOCK_RANGE}). ` +
        `Please request a smaller range.`
      );
    }

    const events = await this.client.getLogs({
      address: this.contractAddress,
      event: {
        type: "event",
        name: "ValueUpdated",
        inputs: [
          {
            name: "newValue",
            type: "uint256",
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
    this.handleRpcError(error);
    }
}
// 🔹 Centralized RPC Error Handler
  private handleRpcError(error: any): never {
    const message = error?.message?.toLowerCase() || "";

    if (message.includes("timeout")) {
      throw new ServiceUnavailableException(
        "RPC timeout. Silakan coba beberapa saat lagi."
      );
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed")
    ) {
      throw new ServiceUnavailableException(
        "Tidak dapat terhubung ke blockchain RPC."
      );
    }

    throw new InternalServerErrorException(
      "Terjadi kesalahan saat membaca data blockchain."
    );
  }
}