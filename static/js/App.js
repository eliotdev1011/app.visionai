import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";

import { ethMainnet, ethSepolia } from "./constants/chainsForModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";

import { useContext, useEffect } from "react";
import { AppContext } from "./Context/appContext";

import { BrowserProvider } from "ethers";
import Bridge from "./Pages/Bridge";
import BackToTop from "./components/UI/backToTop";
import Footer from "./components/Footer";
import Staking from "./Pages/Staking";

import MiraiLogo from "./assets/Logos/MiraiLogo.png";
import Prototype from "./Pages/Prototype";

function App() {
  const { isLoading, setUserSigner, isConnected, address } =
    useContext(AppContext);

  const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;

  const metadata = {
    name: "VisionAI",
    description: "Venture Into The Future",
    url: "https://mirai.build/",
    icons: [MiraiLogo],
  };

  createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [ethMainnet, ethSepolia],
    projectId,
  });

  const { walletProvider } = useWeb3ModalProvider();

  const getSigner = async () => {
    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    setUserSigner(signer);
  };

  useEffect(() => {
    if (!isConnected) return;
    getSigner();
  }, [address, isConnected]);

  return (
    <BrowserRouter>
      {/* {isLoading && <Loading />} */}

      {/* <BackToTop /> */}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Header />

      <Routes>
        <Route path="/staking" element={<Staking />} />
        {/* <Route path="/bridge" element={<Bridge />} /> */}
        <Route path="/" element={<Prototype />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
