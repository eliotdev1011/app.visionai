// import miraiBuild from "../../../public/gameBuild/build.zip";
import windows from "../../assets/Logos/WIndows.svg";

const Prototype = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full flex px-1 flex-col justify-center items-center max-w-screen-xl min-h-screen">
        <div className="flex gap-5">
          <h2>Available on:</h2>
          <img src={windows} alt="" className="w-[20px]" />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center mt-5 gap-5 mb-5">
            <a href="/gameBuild/build.zip">
              <button className="bg-[#8FFF00] font-bold p-2 text-black">
                Download
              </button>
            </a>
            <span className="font-bold text-[#535353]">( 132.8mb )</span>
          </div>

          <span className="font-bold text-[#ffffff]">Build Version: v0.40</span>
        </div>

        {/* Instructions */}
        <ul className="mt-10 flex flex-col items-center gap-2 max-w-[700px] w-full sm:text-[18px] text-[13px]">
          <li className="text-white shadow-[inset_0_0_5px_4px_rgba(255,255,255,0.14)] sm:gap-2 gap-1 flex-col sm:flex-row h-[120px] w-full border border-[#535353] flex items-center justify-center">
            {" "}
            Download and install HyperPlay from
            <a
              href="https://www.hyperplay.xyz/downloads"
              target="_blank"
              rel="noreferrer"
              className="text-[#8FFF00] underline"
            >
              https://www.hyperplay.xyz/downloads
            </a>
          </li>

          <li className="text-white shadow-[inset_0_0_5px_4px_rgba(255,255,255,0.14)] sm:gap-2 gap-1 h-[120px] w-full border border-[#535353] flex-col flex sm:flex-row items-center justify-center">
            Connect your Metamask wallet to HyperPlay
            <span className="text-[#8FFF00]">
              (mobile version or desktop extension)
            </span>
          </li>

          <li className="text-white shadow-[inset_0_0_5px_4px_rgba(255,255,255,0.14)] sm:gap-2 gap-1 h-[120px] w-full border border-[#535353] flex items-center justify-center">
            Download and install the{" "}
            <span className="text-[#8FFF00]">Mirai</span> application using the{" "}
            <a href="/gameBuild/build.zip" className="cursor-pointer">
              <div className="text-[#8FFF00] underline">link</div>
            </a>
            below
          </li>

          <li className="text-white shadow-[inset_0_0_5px_4px_rgba(255,255,255,0.14)] sm:gap-2 gap-1 h-[120px] w-full border border-[#535353] flex items-center justify-center">
            Ensure <span className="text-[#8FFF00]">HyperPlay</span> is running
            & your wallet is{" "}
            <span className="text-[#8FFF00] underline">connected</span>
          </li>
        </ul>

        {/* Questions and feedback */}
        <div className="borde flex flex-col items-center mt-5">
          <h3 className="font-bold text-[20px]">Questions & Feedback</h3>
          <span className="text-[#6B6B6B] text-center mt-3">
            We would like to hear from you in the official Mirai Telegram group
          </span>
        </div>
      </div>
    </div>
  );
};

export default Prototype;
