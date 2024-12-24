import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import stakeAbi from "../Contracts/StakeAbi.json";
import miraiTokenAbi from "../Contracts/MiraiToken.json";

import tokenServiceAbi from "../Contracts/TokenService.json";
import getChainIdByName from "../utils/getChainIdByName";

import {
  Contract,
  formatEther,
  hexlify,
  JsonRpcProvider,
  parseUnits,
  toBigInt,
  zeroPadValue,
} from "ethers";

// Axelar
import {
  AxelarQueryAPI,
  EvmChain,
  Environment,
  GasToken,
} from "@axelar-network/axelarjs-sdk";

// ABIs
import miraiABI from "../Contracts/MiraiToken.json";

import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";

export const AppContext = createContext();

const ContextProvider = ({ children }) => {
  const ethRPCProvider = new JsonRpcProvider(process.env.REACT_APP_ETH_RPC);
  const sepRPCProvider = new JsonRpcProvider(process.env.REACT_APP_SEP_RPC);
  const maticRPCProvider = new JsonRpcProvider(process.env.REACT_APP_MATIC_RPC);
  const baseRPCProvider = new JsonRpcProvider(process.env.REACT_APP_BASE_RPC);

  const InterchainTokenServiceAdd =
    "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
  const tokenId =
    "0x4a8027cd9f30938d02d74aa1f64fb79eab137106dd3d4a5c83b816604af6cc86";

  const [estimatedFee, setEstimatedFee] = useState(0);
  const [txHash, setTxHash] = useState("");
  const [inputBridgeAmnt, setInputBridgeAmnt] = useState("");

  // Axelar Bridge
  const api = new AxelarQueryAPI({ environment: Environment.MAINNET });

  const { isConnected, address, chainId } = useWeb3ModalAccount();

  const [userSigner, setUserSigner] = useState();
  // Contract Addresses
  const miraiCa = "0x42c83a91B3a79dE5488CD9280A4dF564e13A79EE";

  const stakeContracCa = "0x102f9072bec9Fea359aE687a84B5f4bd33182a33";

  // Bridge
  const [bridgeFromNetwork, setBridgeFromNetwork] = useState("Ethereum");
  const [bridgeToNetwork, setBridgeToNetwork] = useState("Base");
  const [estimatedFeeToBridge, setEstimatedFeeToBridge] = useState(null);

  const invertFromAndToBridgeChains = () => {
    const oldFrom = bridgeFromNetwork;
    const oldTo = bridgeToNetwork;

    setBridgeFromNetwork(oldTo);
    setBridgeToNetwork(oldFrom);
  };

  async function gasEstimator(srcChain, dstChain, gasToken) {
    const gas = await api.estimateGasFee(
      srcChain,
      dstChain,
      dstChain == "ethereum"
        ? parseUnits("200000", 0)
        : parseUnits("400000", 0),
      1.25,
      gasToken,
      dstChain == "ethereum" ? "200000" : "400000"
    );

    setEstimatedFee(formatEther(gas));
  }

  useEffect(() => {
    let sourceChain;
    let dstChain;
    let gasToken;

    if (bridgeFromNetwork && bridgeToNetwork) {
      if (bridgeFromNetwork === "Ethereum") {
        sourceChain = EvmChain.ETHEREUM;
        dstChain = EvmChain.BASE;
        gasToken = GasToken.ETH;
      } else {
        sourceChain = EvmChain.BASE;
        dstChain = EvmChain.ETHEREUM;
        gasToken = GasToken.ETH;
      }
    }

    const intervalId = setInterval(() => {
      gasEstimator(sourceChain, dstChain, gasToken);
    }, 5000);

    // Cleanup interval on network change or component unmount
    return () => clearInterval(intervalId);
  }, [bridgeFromNetwork, isConnected, address, chainId]);

  const bridgeTokens = async () => {
    if (chainId !== getChainIdByName(bridgeFromNetwork)) {
      return infoToast("Change to the selected network.");
    }

    if (userSigner && estimatedFee && inputBridgeAmnt) {
      try {
        setLoadingMsg("Briding Tokens");
        setisLoading(true);
        const interchainTokenServiceContract = new Contract(
          InterchainTokenServiceAdd,
          tokenServiceAbi,
          userSigner
        );

        // Convert tokenId to bytes32 using ethers v6 utilities
        const tokenIdBytes32 = hexlify(zeroPadValue(tokenId, 32));

        const destinationChain =
          bridgeFromNetwork === "Ethereum" ? "base" : "Ethereum"; // Adjusted destination chain format

        const amount = parseUnits(inputBridgeAmnt.toString(), "ether"); // Parse amount to BigInt

        const metadata = "0x"; // Assuming no metadata is needed

        // Trim estimatedFee to 9 decimals
        const trimmedEstimatedFee = Number(estimatedFee).toFixed(9);
        const gasValue = parseUnits(trimmedEstimatedFee.toString(), "ether"); // Gas value in wei

        const currentGasPrice = await ethRPCProvider.getFeeData();

        // Call the interchainTransfer function with formatted parameters
        const bridgeTx =
          await interchainTokenServiceContract.interchainTransfer(
            tokenIdBytes32,
            destinationChain,
            address,
            amount,
            metadata,
            gasValue,
            { value: gasValue, gasPrice: currentGasPrice.gasPrice } // Set the transaction value to the gasValue
          );

        await bridgeTx.wait(); // Wait for the transaction to be mined

        // Set the transaction hash after confirmation
        setisLoading(false);

        setTxHash(bridgeTx.hash);

        setTimeout(() => {
          setTxHash("");
        }, 15000);

        setLoadingMsg("");
        successToast("Bridge Tx Submited");
      } catch (error) {
        infoToast("Something Went Wrong");
        setisLoading(false);
        console.error("Error in bridgeTokens:", error);
      }
    }
  };

  const miraiReadTokenEth = new Contract(miraiCa, miraiABI, ethRPCProvider);
  const miraiTokenContract = new Contract(miraiCa, miraiABI, ethRPCProvider);
  const miraiReadTokenBase = new Contract(miraiCa, miraiABI, baseRPCProvider);

  // Staking

  const newWriteStakeContract = (signer) => {
    return new Contract(stakeContracCa, stakeAbi, signer);
  };

  const newWriteTokenContract = (signer) => {
    return new Contract(miraiCa, miraiTokenAbi, signer);
  };

  const miraiStakeContract = new Contract(
    stakeContracCa,
    stakeAbi,
    ethRPCProvider
  );
  const miraiStakeContractAddress =
    "0x102f9072bec9Fea359aE687a84B5f4bd33182a33";

  const [isLoading, setisLoading] = useState();
  const [loadingMsg, setLoadingMsg] = useState("Loading");

  const successToast = (msg) => {
    toast.success(msg, {
      position: "bottom-left",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const errorToast = (msg) => {
    toast.error(msg, {
      position: "bottom-left",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const infoToast = (msg) => {
    toast.info(msg, {
      position: "bottom-left",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <AppContext.Provider
      value={{
        loadingMsg,
        setLoadingMsg,
        isLoading,
        setisLoading,

        successToast,
        errorToast,
        infoToast,

        // user Connection
        setUserSigner,
        userSigner,
        isConnected,
        address,
        chainId,

        // Providers
        ethRPCProvider,
        maticRPCProvider,
        baseRPCProvider,
        sepRPCProvider,

        // Bridge
        bridgeFromNetwork,
        setBridgeFromNetwork,
        bridgeToNetwork,
        setBridgeToNetwork,
        estimatedFeeToBridge,
        setEstimatedFeeToBridge,
        invertFromAndToBridgeChains,
        bridgeTokens,
        inputBridgeAmnt,
        setInputBridgeAmnt,
        estimatedFee,
        txHash,

        // Staking
        newWriteStakeContract,
        newWriteTokenContract,
        miraiTokenContract,
        miraiStakeContract,
        miraiStakeContractAddress,

        // Read Contracts
        miraiReadTokenEth,
        miraiReadTokenBase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default ContextProvider;
