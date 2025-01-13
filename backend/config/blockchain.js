const Web3 = require('web3');
require('dotenv').config();

// ABI and contract address for NFT and Certificate contracts
const NFT_CONTRACT_ABI = [0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8]; // Your NFT contract ABI
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

const CERTIFICATE_CONTRACT_ABI = [0xf8e81D47203A594245E36C48e151709F0C19fBe8]; // Your Certificate contract ABI
const CERTIFICATE_CONTRACT_ADDRESS = process.env.CERTIFICATE_CONTRACT_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_PROVIDER));

const nftContract = new web3.eth.Contract(
  NFT_CONTRACT_ABI, 
  NFT_CONTRACT_ADDRESS
);

const certificateContract = new web3.eth.Contract(
  CERTIFICATE_CONTRACT_ABI, 
  CERTIFICATE_CONTRACT_ADDRESS
);

module.exports = {
  web3,
  nftContract,
  certificateContract,
  verifyOrganizationNFT: async (organizationAddress) => {
    try {
      const isValidNFT = await nftContract.methods
        .checkOrganizationValidity(organizationAddress)
        .call();
      return isValidNFT;
    } catch (error) {
      console.error('NFT Verification Error:', error);
      return false;
    }
  }
};