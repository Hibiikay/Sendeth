let provider, signer;
const connectBtn = document.getElementById("connectBtn");
const switchBtn = document.getElementById("switchBtn");
const accountEl = document.getElementById("account");
const balanceEl = document.getElementById("balance");
const sendBtn = document.getElementById("sendBtn");
const vote1Btn = document.getElementById("vote1");
const vote2Btn = document.getElementById("vote2");

const CONTRACT_ADDRESS = "0x35cd167FA931C6c5E07AbB2621846FC35D54baD6";
const CONTRACT_ABI = [
  "function vote(uint proposal) external",
  "function giveRightToVote(address voter) external",
  "function delegate(address to) external",
  "function winningProposal() public view returns (uint)",
  "function winnerName() external view returns (string memory)",
  "function proposals(uint) public view returns (string memory name, uint voteCount)",
  "function chairperson() public view returns (address)",
  "function voters(address) public view returns (uint weight, bool voted, address delegate, uint vote)"
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Install MetaMask and try again.");
    return;
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const address = await signer.getAddress();
  accountEl.textContent = `Connected: ${address}`;
  await updateBalance();
}

async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
    alert("Switched to Sepolia Test Network!");
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0xaa36a7",
          chainName: "Sepolia Test Network",
          nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io/"],
        }],
      });
    } else {
      console.error(err);
      alert("Failed to switch: " + err.message);
    }
  }
}

async function updateBalance() {
  if (!signer || !provider) return;
  const address = await signer.getAddress();
  const balanceBigInt = await provider.getBalance(address);
  balanceEl.textContent = `Balance: ${ethers.formatEther(balanceBigInt)} ETH`;
}

async function sendETH() {
  if (!signer) { alert("Connect wallet first"); return; }
  const to = document.getElementById("toAddress").value.trim();
  const amount = document.getElementById("amount").value;
  if (!to || !amount) { alert("Provide recipient and amount"); return; }

  try {
    const txResponse = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    alert(`Transaction sent: ${txResponse.hash}`);
    await txResponse.wait();
    alert("Transaction confirmed!");
    await updateBalance();
  } catch (err) {
    console.error(err);
    alert("Send failed: " + err.message);
  }
}

async function vote(proposalNumber) {
  if (!signer) { alert("Connect wallet first"); return; }
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  try {
    const tx = await contract.vote(proposalNumber);
    alert(`Vote transaction sent: ${tx.hash}`);
    await tx.wait();
    alert("Vote confirmed!");
  } catch (err) {
    console.error(err);
    alert("Vote failed: " + err.message);
  }
}

/* Event listeners */
connectBtn.addEventListener("click", connectWallet);
switchBtn.addEventListener("click", switchToSepolia);
sendBtn.addEventListener("click", sendETH);
vote1Btn.addEventListener("click", () => vote(1));
vote2Btn.addEventListener("click", () => vote(2));