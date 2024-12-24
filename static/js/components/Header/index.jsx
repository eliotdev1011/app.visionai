import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { Link, NavLink } from "react-router-dom";
import shortAdd from "../../utils/shortAdd";
import { BrowserProvider } from "ethers";
import { useContext } from "react";
import { AppContext } from "../../Context/appContext";

import logo from "../../assets/Logos/MiraiLogo.png";

const Header = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useWeb3ModalAccount();

  const { walletProvider } = useWeb3ModalProvider();
  const { setUserSigner } = useContext(AppContext);

  const connectWallet = async () => {
    try {
      open();
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      setUserSigner(signer);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="w-full flex justify-center p-2">
      <div className="max-w-screen-xl w-full flex justify-between items-center">
        <Link to={"/"}>
          <h1 className="flex items-center">
            <img src={logo} alt="" className="flex w-[35px] lg:w-[50px]" />
          </h1>
        </Link>

        {/* Navigation */}
        <div className="flex items-center font-semibold sm:gap-10 gap-5 sm:text-[18px] text-[13px]">
          <NavLink
            className={({ isActive }) =>
              isActive
                ? "text-[#8FFF00] text-center flex items-center justify-center"
                : "text-[#477d00] text-center flex items-center justify-center"
            }
            to="./"
          >
            <span>Prototype</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive
                ? "text-[#8FFF00] text-center flex items-center justify-center"
                : "text-[#477d00] text-center flex items-center justify-center"
            }
            to="./staking"
          >
            <span>Staking</span>
          </NavLink>

          {/* <NavLink
            className={({ isActive }) =>
              isActive
                ? "text-[#8FFF00] text-center flex items-center justify-center"
                : "text-[#477d00] text-center flex items-center justify-center"
            }
            to="./bridge"
          >
            <span>Bridge</span>
          </NavLink> */}

          <button
            onClick={connectWallet}
            className="bg-[#8FFF00] text-[13px] text-black tracking-[1.4px] font-medium flex justify-center items-center sm:w-[150px] w-[110px] sm:h-[33px] h-[28px]"
          >
            {isConnected ? shortAdd(address) : "Connect Wallet"}
          </button>
        </div>

        {/* Mobile Connect */}
        {/* <div className="flex md:hidden">
          <button
            onClick={connectWallet}
            className="bg-[#8846FF] text-[13px] tracking-[1.4px] font-medium flex justify-center items-center rounded-[200px] w-[150px] h-[33px]"
          >
            {isConnected ? shortAdd(address) : "Connect Wallet"}
          </button>
        </div> */}
      </div>

      {/* Mobile Menu */}
      {/* <div className="md:hidden z-[1000] flex justify-around py-2 fixed bottom-0 bg-black border-t border-[#ccc] w-full">
        <NavLink
          className={({ isActive }) =>
            isActive
              ? "text-white text-center flex items-center justify-center"
              : "text-[#858585] text-center flex items-center justify-center"
          }
          to="./"
        >
          <button>
            <img src={selectedHome} alt="" className="w-[35px]" />
          </button>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            isActive
              ? "text-white text-center flex items-center justify-center"
              : "text-[#858585] text-center flex items-center justify-center"
          }
          to="./listings"
        >
          <button>
            {" "}
            <img src={selectMarket} alt="" className="w-[35px]" />
          </button>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? "text-white text-center flex items-center justify-center"
              : "text-[#858585] text-center flex items-center justify-center"
          }
          to="./bridge"
        >
          <button>
            <img src={selectBridge} alt="" className="w-[35px]" />
          </button>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? "text-white text-center flex items-center justify-center"
              : "text-[#858585] text-center flex items-center justify-center"
          }
          to="./user"
        >
          <button>
            <img src={selectUser} alt="" className="w-[35px]" />
          </button>
        </NavLink>
      </div> */}
    </header>
  );
};

export default Header;
