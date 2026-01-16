const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");

// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  console.log({ balance });
  return (balance / 1e18).toFixed(4);
}

let walletAddress = '';
let chainId = '';
let isConnected = false;

function shortenAddress(addr) {
  if (!addr) return '-';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  console.log("window.ethereum", window.ethereum);

  try {
    statusEl.textContent = "Connecting...";

    // Request wallet accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    walletAddress = accounts[0];
    isConnected = true;
    addressEl.innerText = shortenAddress(walletAddress);

    console.log({ walletAddress });

    // Get chainId
    const networkId = await window.ethereum.request({
      method: "eth_chainId",
    });
    chainId = networkId;
    validateNetwork(chainId);

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      statusEl.textContent = "Connected ✅";
      statusEl.style.color = "#4cd137";

      // Get AVAX balance
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [walletAddress, "latest"],
      });

      console.log({ balanceWei });

      balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
      networkEl.textContent = "Wrong Network ❌";
      statusEl.textContent = "Please switch to Avalanche Fuji";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Connection Failed ❌";
  }
}

function disconnectWallet() {
  isConnected = false;
  walletAddress = '';
  chainId = '';
  addressEl.innerText = '-';
  networkEl.textContent = '-';
  balanceEl.textContent = '-';
  statusEl.textContent = 'Not Connected';
  statusEl.style.color = '';
  connectBtn.textContent = 'Connect Wallet';
  connectBtn.disabled = false;
}

function validateNetwork(chainId) {
  if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
    statusEl.innerText = '✅ Avalanche Fuji';
  } else {
    statusEl.innerText = '❌ Wrong Network';
  }
}

connectBtn.addEventListener("click", async () => {
  if (!isConnected) {
    await connectWallet();
    if (isConnected) {
      connectBtn.textContent = 'Disconnect Wallet';
    }
  } else {
    disconnectWallet();
  }
});

if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (!Array.isArray(accounts) || accounts.length === 0) {
      walletAddress = '';
      isConnected = false;
      addressEl.innerText = '-';
      networkEl.textContent = '-';
      balanceEl.textContent = '-';
      statusEl.textContent = 'Not Connected';
      connectBtn.textContent = 'Connect Wallet';
      return;
    }
    walletAddress = accounts[0];
    if (isConnected) addressEl.innerText = shortenAddress(walletAddress);
  });

  window.ethereum.on('chainChanged', (chainId) => {
    // Only validate network visually if the user has connected
    if (isConnected) validateNetwork(chainId);
  });
}
