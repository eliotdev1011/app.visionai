import { Helmet } from "react-helmet-async";
import { useContext, useEffect, useState } from "react";
import stakeABI from "../../Contracts/StakeAbi.json";
import convertSecondsToDaysHoursMinutes from "../../utils/formaters/convertSecondsToDaysHoursMinutes.js";

import { useWeb3ModalAccount } from "@web3modal/ethers/react";

import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract, formatUnits, parseEther } from "ethers";
import {
  trimToTwoDecimals,
  trimToNoDecimals,
  formatNumberWithCommas,
} from "../../utils/index.js";

import alertIcon from "../../assets/Icons/alert.svg";
import lock from "../../assets/Icons/lock.svg";
import tvlIcon from "../../assets/Icons/totalLocked.svg";
import Loading from "../../components/UI/LoadingAnimation";
import axios from "axios";
import { AppContext } from "../../Context/appContext";

import activeImg from "../../assets/active.svg";
import inactiveImg from "../../assets/inactive.svg";
import closedImg from "../../assets/closed.svg";

const Staking = () => {
  const { isConnected, address } = useWeb3ModalAccount();

  const { walletProvider } = useWeb3ModalProvider();

  const [loading, setLoading] = useState(false);

  const [selectedPercent, setSelectedPercent] = useState();
  const [selectedBalance, setSelectedBalance] = useState(0);

  const [userTokenBal, setUserTokenBal] = useState("0");
  const [userEarned, setUserEarned] = useState("0");
  const [userAmountStaked, setUserAmountStaked] = useState("0");
  const [userUnstakeInit, setUserUnstakeInit] = useState(false);
  const [userTimeToUnstake, setUserTimeToUnstake] = useState();

  const [stakeAmount, setStakeAmount] = useState("");

  const [totalStaked, setTotalStaked] = useState(0);
  const [unstakeTimeLook, setUnstakeTimeLook] = useState("");
  const [unstakeFeePercent, setUnstakeFeePercent] = useState("");

  const [mzroPrice, setMzroPrice] = useState();

  const [isLoading, setIsLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState("Loading");

  const {
    newWriteStakeContract,
    newWriteTokenContract,
    miraiTokenContract,
    miraiStakeContract,
    miraiStakeContractAddress,
    miraiReadTokenEth,
    errorToast,
    successToast,
    infoToast,
  } = useContext(AppContext);

  const getUserInfo = async (reload) => {
    if (!reload) setLoading(true);

    try {
      const userEraned = await miraiStakeContract.calculateEarnedRewards(
        address
      );
      const balance = await miraiTokenContract.balanceOf(address);
      const stakers = await miraiStakeContract.stakers(address);

      const remainingTimeToUnstake =
        await miraiStakeContract.checkRemainingLockTime(address);

      setUserEarned(trimToTwoDecimals(formatUnits(userEraned, 18)));
      setUserTokenBal(trimToTwoDecimals(formatUnits(balance, 18)));

      setUserAmountStaked(formatUnits(stakers[0], 18));
      setUserUnstakeInit(formatUnits(stakers[3], 0) !== "0");

      setUserTimeToUnstake(Number(formatUnits(remainingTimeToUnstake, 0)));

      setLoading(false);
    } catch (error) {
      console.log("user", error);
      setLoading(false);
    }
  };

  const getContractInfo = async () => {
    try {
      const balance = await miraiReadTokenEth.balanceOf(
        miraiStakeContractAddress
      );

      // console.log("Balance:", trimToNoDecimals(formatUnits(balance, 18)));

      const totalStake = await miraiStakeContract.totalTokensStaked();
      const unstFee = await miraiStakeContract.withdrawalFeePercentage();
      const unstTimLoc = await miraiStakeContract.stakingWithdrawalTimeLock();

      setUnstakeTimeLook(formatUnits(unstTimLoc, 0) / 60 / 60 / 24);
      setUnstakeFeePercent(formatUnits(unstFee, 0) / 100);
      setTotalStaked(trimToNoDecimals(formatUnits(totalStake, 18)));
      // setTotalStaked(12);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const stakeTokens = async () => {
    if (!isConnected) return errorToast("User Not Connected!");
    if (userUnstakeInit)
      return infoToast("Cannot stake after initiating unstake!");

    if (Number(stakeAmount) === 0)
      return infoToast("Please, provide a valid amount!");

    if (Number(userTokenBal) < Number(stakeAmount))
      return infoToast("Not enough balance");

    try {
      setIsLoading(true);
      setLoadMessage("Approving Tokens");

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const stakeCA = "0x102f9072bec9Fea359aE687a84B5f4bd33182a33";

      const stakeContract = new Contract(stakeCA, stakeABI, signer);

      const tokenContract = newWriteTokenContract(signer);

      const data = await miraiTokenContract.allowance(
        address,
        miraiStakeContractAddress
      );

      if (
        Number(trimToNoDecimals(stakeAmount)) > Number(formatUnits(data, 18))
      ) {
        const approveTokens = await tokenContract.approve(
          miraiStakeContractAddress,
          parseEther(trimToNoDecimals(stakeAmount).toString())
        );

        await approveTokens.wait();
      }

      setLoadMessage("Staking Mirai");
      const stakeTokens = await stakeContract.depositStake(
        parseEther(trimToNoDecimals(stakeAmount).toString())
      );

      await stakeTokens.wait();

      getUserInfo(true);
      getContractInfo();
      successToast("Mirai Staked!");

      setIsLoading(false);
      setLoadMessage("");
    } catch (error) {
      setIsLoading(false);
      errorToast("Something Went Wrong");
      console.log(error);
    }
  };

  const claimRewards = async () => {
    if (!isConnected) return errorToast("User Not Connected!");
    if (0 === Number(userAmountStaked))
      return infoToast("No Rewards Available!");

    if (0 === Number(userEarned)) return infoToast("No Rewards Available!");

    try {
      setIsLoading(true);
      setLoadMessage("Claiming Reward Tokens");

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const stakeContract = newWriteStakeContract(signer);

      const claimReward = await stakeContract.withdrawRewards();

      await claimReward.wait();

      getUserInfo(true);

      setIsLoading(false);
      setLoadMessage("");

      successToast("Rewards Claimed!");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      errorToast("Something went wrong.");
    }
  };

  const initiateUnstake = async () => {
    if (!isConnected) return errorToast("User Not Connected!");
    if (0 === Number(userAmountStaked)) return errorToast("No Tokens Staked!");

    try {
      setIsLoading(true);
      setLoadMessage("Initiating Unstake");

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const stakeContract = newWriteStakeContract(signer);

      const initiateUnst = await stakeContract.beginUnstaking();

      await initiateUnst.wait();

      getUserInfo(true);

      setLoadMessage("");
      setIsLoading(false);
      successToast("Unstake Initiated!");
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const withdrawTokens = async () => {
    if (!isConnected) return errorToast("User Not Connected!");
    if (
      userTimeToUnstake !== 0 ||
      Number(userAmountStaked) === 0 ||
      !userUnstakeInit
    )
      return infoToast("No Tokens Available to Unlock!");

    try {
      setIsLoading(true);
      setLoadMessage("Initiating Withdraw");

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const stakeContract = newWriteStakeContract(signer);

      const withDraw = await stakeContract.finalizeUnstaking();

      await withDraw.wait();

      getUserInfo(true);
      setIsLoading(false);
      setLoadMessage("");
      successToast("Tokens Withdrawn");
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const getPrice = async () => {
    const apiKey = process.env.REACT_APP_API_KEY;

    try {
      await axios
        .get(
          "https://public-api.dextools.io/trial/v2/token/ether/0x42c83a91b3a79de5488cd9280a4df564e13a79ee/price",
          {
            headers: {
              accept: "application/json",
              "X-API-KEY": apiKey,
            },
          }
        )
        .then((response) => {
          setMzroPrice(response.data.data.price);
        })
        .catch((error) => {
          console.error("Error making request:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const setSelectedAmount = (amount) => {
    if (Number(userTokenBal) === 0) return errorToast("Not enough balance!");

    if (Number(amount) === Number(selectedPercent)) {
      setSelectedPercent(0);
      setStakeAmount(0);
    }

    setSelectedPercent(amount);
    setStakeAmount(Number(userTokenBal) * (amount / 100));
  };

  const handleStakeAmount = (e) => {
    setStakeAmount(e.target.value);
    setSelectedPercent(0);
  };

  useEffect(() => {
    getPrice();
    getContractInfo();

    if (!isConnected) return;

    // Call the functions initially
    getUserInfo();

    // Set up the interval for getUserInfo
    const userInfoInterval = setInterval(() => {
      getUserInfo(true);
    }, 5000); // 5 seconds

    // Set up the interval for getContractInfo
    const contractInfoInterval = setInterval(() => {
      getContractInfo();
    }, 30000); // 30 seconds

    // Clear intervals when the component unmounts or dependencies change
    return () => {
      clearInterval(userInfoInterval);
      clearInterval(contractInfoInterval);
    };
  }, [isConnected, address]);

  const [percentage, setPercentage] = useState(0); // Initial percentage (you can set any default value)

  // Function to handle dragging of the slider
  const handleDrag = (e) => {
    const slider = e.currentTarget.getBoundingClientRect();
    const newPercentage = ((e.clientX - slider.left) / slider.width) * 100;

    // Clamp the percentage value between 0 and 100
    setPercentage(Math.min(100, Math.max(0, newPercentage)));
    setSelectedPercent(Math.min(100, Math.max(0, newPercentage)));
    setSelectedAmount(Math.min(100, Math.max(0, newPercentage)));
  };

  return (
    <>
      {/* <Helmet>
        <title>Staking</title>
      </Helmet> */}

      <div className="w-full min-h-screen flex justify-center">
        {isLoading && <Loading text={loadMessage} />}

        <div className="text-white mt-2 mb-20 sm:mt-20 py-[50px] flex w-full max-w-screen-xl">
          <div className="flex flex-col items-center gap-10 w-full pt-10">
            {/* Banner */}
            <div className="w-full items-center sm:px-4 px-2 justify-center flex flex-col gap-[18px]">
              {/* card 1 */}
              <div className="w-full max-w-[750px] flex flex-col sm:gap-[20px] gap-[10px] items-start">
                {/* TVL Tag */}
                <div className="flex justify-between w-full gap-1 h-[50px]">
                  <div className="text-white w-[250px] font-bold text-[18px] flex items-center justify-start">
                    Total Value Locked
                  </div>

                  {/* TVL in USD */}
                  <div className="flex leading-[27px] gap-2 justify-center items-center text-[18px] text-[#8FFF00] tracking-[1.18px] font-medium">
                    <img src={lock} alt="" className="w-[15px]" />

                    {totalStaked === ""
                      ? "Loading..."
                      : formatNumberWithCommas(
                          trimToNoDecimals(totalStaked * mzroPrice)
                        ) +
                        " " +
                        "USD"}
                  </div>
                </div>
              </div>

              {/* card 2 */}
              <div className="w-full gap-1 max-w-[750px] flex flex-col sm:flex-row items-center">
                {/* TVL Staked */}
                <div className="flex flex-col max-w-[400px] w-full">
                  <div className="bg-[#242424] h-[46px] rounded-t-[5px] text-[#afafaf] flex justify-center py-[5px] text-[14px] px-[17px] items-center gap-[12px]">
                    Total Staked
                  </div>

                  {/* TVLS */}
                  <div className="border-[#242424] rounded-b-[5px] border flex leading-[27px] justify-center items-center h-[51px] w-full text-[16px] tracking-[1.18px] font-medium text-[#fff]">
                    {totalStaked === ""
                      ? " Loading..."
                      : formatNumberWithCommas(totalStaked) + " MIRAI"}
                  </div>
                </div>

                <div className="flex flex-col max-w-[400px] w-full">
                  {/* Circulating Supply Staked */}
                  <div className="bg-[#242424] h-[46px] rounded-t-[5px] text-[#afafaf] flex justify-center py-[5px] text-[14px] px-[17px] items-center gap-[12px]">
                    Staking APR
                  </div>
                  {/* CSS */}
                  <div className="border-[#242424] rounded-b-[5px] border flex leading-[27px] justify-center items-center h-[51px] w-full text-[16px] tracking-[1.18px] font-medium text-[#fff]">
                    <span className="text-[20px]">
                      {totalStaked === ""
                        ? " Loading..."
                        : trimToTwoDecimals((20000000 / totalStaked) * 100) +
                          " %"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disconnected Message */}
            {!isConnected && (
              <div className="flex flex-col items-center">
                <h2 className="text-[35px] font-medium ">Connect Wallet</h2>
                <span className="text-[#A4F92B] text-[17px]">
                  To display your positions
                </span>
              </div>
            )}

            {/* user info */}
            {isConnected && (
              <div className="flex flex-col items-center p-2 sm:p-4 flex-wrap gap-10 w-full justify-center">
                <div className="flex flex-col max-w-[750px] w-full">
                  {/* Header */}
                  <div className="w-full flex flex-col items-center md:flex-row justify-between text-[22px]">
                    <h2 className="">Select Percentage </h2>
                    <h2 className="text-[#535353] text-[16px]">
                      Balance: {userTokenBal}{" "}
                    </h2>
                  </div>

                  {/* Percentage */}
                  <div className="flex gap-2 justify-center md:justify-start">
                    <span>{Math.round(percentage)}%</span>
                    <span className="text-[#777777]">
                      ( {trimToNoDecimals(stakeAmount)} )
                    </span>
                  </div>

                  {/* Slider */}
                  <div className="w-full mt-4">
                    {/* Slider Container */}
                    <div
                      className="w-full h-2 bg-[#444444] rounded-md relative cursor-pointer"
                      onMouseDown={(e) => handleDrag(e)}
                      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)} // Only drag when the mouse is pressed
                    >
                      {/* The green selected part */}
                      <div
                        className="h-2 bg-[#8FFF00] rounded-md absolute top-0 left-0"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Optional text to show percentage under the slider */}
                    <div className="select-none flex font-bold justify-between text-xs mt-1 text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedAmount(0);
                          setPercentage(0);
                        }}
                        className={
                          Math.round(percentage) === 0
                            ? "text-[#8FFF00]"
                            : "text-[#535353]"
                        }
                      >
                        0%
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAmount(25);
                          setPercentage(25);
                        }}
                        className={
                          Math.round(percentage) === 25
                            ? "text-[#8FFF00]"
                            : "text-[#535353]"
                        }
                      >
                        25%
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAmount(50);
                          setPercentage(50);
                        }}
                        className={
                          Math.round(percentage) === 50
                            ? "text-[#8FFF00]"
                            : "text-[#535353]"
                        }
                      >
                        50%
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAmount(75);
                          setPercentage(75);
                        }}
                        className={
                          Math.round(percentage) === 75
                            ? "text-[#8FFF00]"
                            : "text-[#535353]"
                        }
                      >
                        75%
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAmount(100);
                          setPercentage(100);
                        }}
                        className={
                          Math.round(percentage) === 100
                            ? "text-[#8FFF00]"
                            : "text-[#535353]"
                        }
                      >
                        100%
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 w-full flex justify-end">
                    <span className="text-[#fff] font-medium text-[15px]">
                      Staked: {loading ? "Loading" : userAmountStaked}
                    </span>
                  </div>

                  <div className="flex sm:gap-2 gap-1 items-center">
                    {/* Balance and Stake */}
                    <div className="flex max-w-[50%] w-full">
                      <div className="flex gap-[10px] w-full flex-col">
                        {/* input */}
                        <div className="sm:mt-[13px] mt-[5px] relative flex justify-between items-center p-2 sm:h-[51px] h-[40px] w-full rounded-[5px] border border-[#242424]">
                          <input
                            value={trimToNoDecimals(stakeAmount)}
                            onChange={handleStakeAmount}
                            min={0}
                            type="text"
                            placeholder="0.0"
                            className="placeholder:text-[#535353] bg-transparent sm:text-[18px] text-[13px] px-2 text-center outline-none w-full"
                          />
                        </div>

                        {/* approve */}
                        <button
                          onClick={stakeTokens}
                          className="relative sm:h-[51px] h-[40px] sm:text-[20px] text-[15px] rounded-[5px] font-medium text-black w-full flex items-center justify-center text-center bg-[#8FFF00]"
                        >
                          {userUnstakeInit && (
                            <div className="w-full flex items-center justify-center h-full absolute bg-[#00000077] rounded-[5px] top-0 bottom-0 left-0 right-0">
                              <img src={tvlIcon} alt="" />
                            </div>
                          )}
                          Stake
                        </button>
                      </div>
                    </div>

                    {/* Position */}
                    <div className="flex max-w-[50%] w-full">
                      <div className="flex gap-[10px] w-full flex-col">
                        {/* input */}
                        <div className="sm:mt-[13px] mt-[5px] relative flex justify-between items-center p-2 sm:h-[51px] h-[40px] w-full rounded-[5px] border border-[#242424]">
                          <h2 className="text-white text-[13px]">Rewards</h2>
                          <h2 className="text-[#fff] flex items-center justify-center bg-transparent text-[18px] px-2">
                            {loading ? "Loading" : userEarned}
                          </h2>
                        </div>

                        {/* approve */}
                        <button
                          onClick={claimRewards}
                          className="relative sm:h-[51px] h-[40px] sm:text-[20px] text-[15px] rounded-[5px] font-medium text-black w-full flex items-center justify-center text-center bg-[#8FFF00]"
                        >
                          {Number(userEarned) === 0 && (
                            <div className="w-full flex items-center rounded-[5px] justify-center h-full absolute bg-[#00000077] top-0 bottom-0 left-0 right-0">
                              <img src={tvlIcon} alt="" />
                            </div>
                          )}
                          Claim Rewards
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex mt-10 w-full">
                    <div className="flex w-full flex-col gap-[13px]">
                      {/* status */}
                      <div className="flex justify-between text-[#fff] gap-5 text-[18px] py-2 font-bold w-full items-center">
                        <h2> Staking Status:</h2>
                        <span className="font-medium">
                          {loading ? (
                            "Loading"
                          ) : userUnstakeInit ? (
                            <div className="flex justify-center items-center gap-2">
                              <img
                                src={closedImg}
                                alt=""
                                className="w-[14px]"
                              />
                              <span className="text-[16px] leading-[15px]">
                                Closed
                              </span>
                            </div>
                          ) : Number(userAmountStaked) === 0 ? (
                            <div className="flex justify-center items-center gap-2">
                              <img
                                src={inactiveImg}
                                alt=""
                                className="w-[14px]"
                              />
                              <span className="text-[16px] leading-[15px]">
                                Inactive
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-center items-center gap-2">
                              <img
                                src={activeImg}
                                alt=""
                                className="w-[14px]"
                              />
                              <span className="text-[16px] leading-[15px]">
                                Active
                              </span>
                            </div>
                          )}
                        </span>
                      </div>

                      <div className="flex sm:gap-2 gap-1">
                        {/* unstake */}
                        {userUnstakeInit ? (
                          <div className="relative flex sm:h-[51px] h-[40px] w-full max-w-[50%] border rounded-[5px] border-[#8FFF00]">
                            <div className="max-w-[375px] text-[#8FFF00] rounded-[5px] flex items-center justify-center bg-transparent sm:text-[16px] text-[13px] px-2 text-center outline-none w-full">
                              {Number(userTimeToUnstake) === 0 ? (
                                "Unlocked!"
                              ) : (
                                <>
                                  Unlock:{" "}
                                  {convertSecondsToDaysHoursMinutes(
                                    userTimeToUnstake
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex sm:h-[51px] h-[40px] w-full max-w-[50%]">
                            <button
                              onClick={initiateUnstake}
                              className="max-w-[375px] bg-[#8FFF00] rounded-[5px] text-black flex items-center justify-center sm:text-[16px] text-[13px] px-2 text-center outline-none w-full"
                            >
                              {0 === Number(userAmountStaked) && (
                                <div className="flex items-center rounded-[5px] justify-center h-full absolute bg-[#00000077] top-0 bottom-0 left-0 right-0">
                                  <img src={tvlIcon} alt="" />
                                </div>
                              )}
                              Initiate Unstake
                            </button>
                          </div>
                        )}

                        {/* approve */}
                        <button
                          onClick={withdrawTokens}
                          className="relative sm:h-[51px] h-[40px] rounded-[5px] text-black max-w-[50%] sm:text-[16px] text-[13px] font-medium w-full flex items-center justify-center text-center bg-[#8FFF00]"
                        >
                          {(!userUnstakeInit ||
                            Number(userAmountStaked) === 0 ||
                            Number(userTimeToUnstake) !== 0) && (
                            <div className="w-full rounded-[5px] flex items-center justify-center h-full absolute bg-[#00000077] top-0 bottom-0 left-0 right-0">
                              <img src={tvlIcon} alt="" />
                            </div>
                          )}
                          Withdraw Tokens
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* buttons */}
            <div className="flex gap-[5px] sm:gap-[10px] w-full sm:text-[18px] text-[11px] text-[#ffffff]">
              <div className="flex gap-4 leading-[27px] text-[#535353] justify-center items-center h-[40px] w-full tracking-[0.44px] font-medium">
                <img src={alertIcon} alt="" className="w-[20px]" />
                Withdraw Lock:{" "}
                {unstakeTimeLook === ""
                  ? " Loading..."
                  : unstakeTimeLook + " " + "days"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Staking;
