import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import marketplaceAbi from "/contract/marketplace.abi.json";
import erc20Abi from "../contract/erc20.abi.json";

const ERC20_DECIMALS = 18;
const MPContractAddress = "0x5334EA34BCADA7f9559aF476c38727515BCD7F1F";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

let kit;
let contract;
let donations = [];

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.");
    try {
      await window.celo.enable();
      notificationOff();

      const web3 = new Web3(window.celo);
      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress);
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.");
  }
};

async function approve(_minimumDonationAmount) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress);

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _minimumDonationAmount)
    .send({ from: kit.defaultAccount });
  return result;
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  document.querySelector("#balance").textContent = cUSDBalance;
};

const getDonations = async function () {
  const _donationsLength = await contract.methods.getDonationsLength().call();
  const _donations = [];
  for (let i = 0; i < _donationsLength; i++) {
    let _donation = new Promise(async (resolve, reject) => {
      let d = await contract.methods.readDonation(i).call();
      resolve({
        index: i,
        owner: d[0],
        name: d[1],
        image: d[2],
        description: d[3],
        location: d[4],
        budget: new BigNumber(d[5]),
        totalAmountGotSoFar: new BigNumber(d[6]),
      });
    });
    _donations.push(_donation);
  }
  donations = await Promise.all(_donations);
  renderDonations();
};

function renderDonations() {
  document.getElementById("main").innerHTML = "";
  donations.forEach((_donation) => {
    const newDiv = document.createElement("div");
    newDiv.className = "col-md-4";
    newDiv.innerHTML = donationTemplate(_donation);
    document.getElementById("main").appendChild(newDiv);
  });
}

function donationTemplate(_donation) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_donation.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        $${_donation.budget - _donation.totalAmountGotSoFar} left
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_donation.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_donation.name}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_donation.description}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_donation.location}</span>
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>Budger: <span class="fw-bold">${_donation.budget}</span></span>
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark donateBtn fs-6 p-3" id=${
            _donation.index
          }>
            Donate ${_donation.minimumDonationAmount
              .shiftedBy(-ERC20_DECIMALS)
              .toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `;
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL();

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `;
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block";
  document.querySelector("#notification").textContent = _text;
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none";
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...");
  await connectCeloWallet();
  await getBalance();
  await getDonations();
  notificationOff();
});

document
  .querySelector("#newDonationBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newDonationName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newDonationDescription").value,
      document.getElementById("newLocation").value,
      new BigNumber(document.getElementById("newAmount").value)
        .shiftedBy(ERC20_DECIMALS)
        .toString(),
    ];
    notification(`⌛ Adding "${params[0]}"...`);
    try {
      const result = await contract.methods
        .writeDonation(...params)
        .send({ from: kit.defaultAccount });
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
    notification(`🎉 You successfully added "${params[0]}".`);
    getDonations();
  });

document.querySelector("#main").addEventListener("click", async (e) => {
  if (e.target.className.includes("donateBtn")) {
    const index = e.target.id;
    notification("⌛ Waiting for payment approval...");
    try {
      await approve(donations[index].price);
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
    notification(`⌛ Awaiting payment for "${donations[index].name}"...`);
    try {
      const result = await contract.methods
        .donate(index)
        .send({ from: kit.defaultAccount });
      notification(`🎉 You successfully bought "${donations[index].name}".`);
      getDonations();
      getBalance();
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
  }
});
