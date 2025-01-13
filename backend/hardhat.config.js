require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20", // Use the correct version for your contracts
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
