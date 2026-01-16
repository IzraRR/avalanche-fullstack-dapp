'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useChainId,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';

// ==============================
// 🔹 CONFIG
// ==============================

// 👉 GANTI dengan contract address hasil deploy kamu
const CONTRACT_ADDRESS = '0x93f3d3c1f05ab051747a626e0168b30b37fa8eb7' as `0x${string}`;

// 👉 ABI SIMPLE STORAGE
const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ==============================
// 🔹 TOAST COMPONENT
// ==============================
function Toast({
  message,
  type,
  visible,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}) {
  if (!visible) return null;

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded text-white ${bgColor} shadow-lg transition-opacity duration-300`}
    >
      {message}
    </div>
  );
}

// ==============================
// 🔹 HELPER FUNCTIONS
// ==============================
function shortenAddress(address: string | undefined) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getExplorerLink(txHash: string) {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}

export default function Page() {
  // ==============================
  // 🔹 WALLET STATE
  // ==============================
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // ==============================
  // 🔹 LOCAL STATE
  // ==============================
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // ==============================
  // 🔹 READ CONTRACT
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
    error: readError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    query: {
      enabled: isConnected && chainId === avalancheFuji.id,
    },
  });

  // ==============================
  // 🔹 WRITE CONTRACT
  // ==============================
  const {
    writeContract,
    isPending: isWriting,
    data: writeData,
    error: writeError,
  } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        setTxHash(data);
        setInputValue('');
        setToast({ message: 'Transaction submitted!', type: 'info' });
        setErrorMessage('');
      },
      onError: (error: any) => {
        // Handle different error types
        const errorMsg = error?.message || 'Transaction failed';

        if (errorMsg.includes('rejected')) {
          setErrorMessage('User rejected the transaction');
          setToast({
            message: 'Transaction rejected by user',
            type: 'error',
          });
        } else if (errorMsg.includes('network')) {
          setErrorMessage('Wrong network. Please switch to Fuji');
          setToast({
            message: 'Wrong network. Please switch to Avalanche Fuji',
            type: 'error',
          });
        } else if (errorMsg.includes('revert')) {
          setErrorMessage('Transaction reverted');
          setToast({
            message: 'Transaction reverted. Check your input.',
            type: 'error',
          });
        } else {
          setErrorMessage(errorMsg);
          setToast({
            message: 'Transaction error: ' + errorMsg,
            type: 'error',
          });
        }
      },
    },
  });

  // ==============================
  // 🔹 WAIT FOR TX RECEIPT
  // ==============================
  const { isLoading: isWaitingTx, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash || undefined,
      query: {
        enabled: !!txHash,
        refetchInterval: 2000,
      },
    });

  // Refresh value after successful tx
  useEffect(() => {
    if (isTxSuccess) {
      setToast({
        message: 'Transaction confirmed! ✓',
        type: 'success',
      });
      setTxHash(null);
      setTimeout(() => {
        refetch();
      }, 500);
    }
  }, [isTxSuccess, refetch]);

  // ==============================
  // 🔹 HANDLERS
  // ==============================
  const isWrongNetwork = isConnected && chainId !== avalancheFuji.id;

  const handleSetValue = async () => {
    if (!inputValue || !isConnected) {
      setErrorMessage('Please enter a value and connect wallet');
      return;
    }

    if (isWrongNetwork) {
      setErrorMessage('Please switch to Avalanche Fuji network');
      setToast({
        message: 'Wrong network. Please switch to Avalanche Fuji',
        type: 'error',
      });
      return;
    }

    setErrorMessage('');

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValue',
      args: [BigInt(inputValue)],
    });
  };

  const handleConnectWallet = () => {
    // Prefer WalletConnect if available, otherwise use first connector
    const wcConnector = connectors.find((c) => c.id === 'walletConnect');
    const connector = wcConnector || connectors[0];

    if (connector) {
      connect({ connector });
    }
  };

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-4">
      <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 space-y-6 shadow-xl">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Day 3 – Simple Storage dApp</h1>
          <p className="text-xs text-gray-400 mt-1">Avalanche Fuji Network</p>
        </div>

        {/* ==========================
            TASK 1: WALLET CONNECTION WITH REOWN
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <p className="text-sm text-gray-400">🔗 Wallet Connection</p>

          {!isConnected ? (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? '⏳ Connecting...' : '🔗 Connect Wallet'}
            </button>
          ) : (
            <div className="space-y-2 bg-gray-800 rounded p-3">
              <p className="text-xs text-gray-400">Connected Address</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-bold">
                  {shortenAddress(address)}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(address || '');
                    setToast({
                      message: 'Address copied!',
                      type: 'success',
                    });
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>

              <button
                onClick={() => disconnect()}
                className="w-full text-red-400 text-xs hover:text-red-300 underline mt-2 py-1"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* ==========================
            TASK 1: NETWORK STATUS
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <p className="text-sm text-gray-400">🌐 Network Status</p>

          {!isConnected ? (
            <p className="text-xs text-yellow-500">Not connected</p>
          ) : isWrongNetwork ? (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded p-2">
              <p className="text-xs text-red-400">
                ⚠️ Wrong Network
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Please switch to Avalanche Fuji
              </p>
            </div>
          ) : (
            <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded p-2">
              <p className="text-xs text-green-400">✓ Connected to Fuji</p>
              <p className="text-xs text-gray-300 mt-1">Chain ID: {chainId}</p>
            </div>
          )}
        </div>

        {/* ==========================
            TASK 2: READ CONTRACT
        ========================== */}
        {isConnected && !isWrongNetwork && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-400">📖 Read Contract Value</p>

            {readError ? (
              <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded p-2">
                <p className="text-xs text-red-400">Error reading contract</p>
              </div>
            ) : isReading ? (
              <p className="text-xs text-gray-400">⏳ Loading value...</p>
            ) : (
              <div className="bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-400">Current Value</p>
                <p className="text-3xl font-bold text-blue-400">
                  {value?.toString() || '0'}
                </p>
              </div>
            )}

            <button
              onClick={() => refetch()}
              disabled={isReading}
              className="w-full text-sm bg-gray-700 hover:bg-gray-600 py-1 rounded transition disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {/* ==========================
            TASK 3: WRITE CONTRACT
        ========================== */}
        {isConnected && !isWrongNetwork && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-400">✍️ Update Contract Value</p>

            <input
              type="number"
              placeholder="Enter new value"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setErrorMessage('');
              }}
              disabled={isWriting || isWaitingTx}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white text-sm disabled:opacity-50"
            />

            {/* TASK 3: HANDLE LOADING & ERROR */}
            {errorMessage && (
              <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded p-2">
                <p className="text-xs text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* TASK 4: DISABLE BUTTON WHEN TX PENDING */}
            <button
              onClick={handleSetValue}
              disabled={
                isWriting || isWaitingTx || !isConnected || isWrongNetwork
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWriting ? '⏳ Submitting...' : isWaitingTx ? '⏳ Confirming...' : '📝 Set Value'}
            </button>

            {/* TASK 4: TX STATUS & EXPLORER LINK */}
            {txHash && (
              <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded p-2">
                <p className="text-xs text-blue-400">Transaction Pending</p>
                <a
                  href={getExplorerLink(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 hover:text-blue-200 underline mt-1 inline-block"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ==========================
            ERROR & NETWORK NOTICE
        ========================== */}
        {isConnected && isWrongNetwork && (
          <div className="border-t border-gray-700 pt-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded p-3">
            <p className="text-sm text-yellow-400">⚠️ Network Mismatch</p>
            <p className="text-xs text-gray-300 mt-2">
              This dApp only works on Avalanche Fuji testnet. Please switch
              networks in your wallet.
            </p>
          </div>
        )}

        {/* FOOTNOTE */}
        <p className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          💡 Smart contract = single source of truth
        </p>
      </div>

      {/* TOAST NOTIFICATIONS */}
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        visible={!!toast}
      />
    </main>
  );
}
