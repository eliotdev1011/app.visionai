import miraiLogo from "../../assets/Logos/MiraiLogo.png";

// Socials
import twitter from "../../assets/SocialIcons/twitter.png";
import telegram from "../../assets/SocialIcons/telegram.png";
import dextools from "../../assets/Icons/dextools.svg";
import uniswap from "../../assets/SocialIcons/coins.png";

const Footer = () => {
  return (
    <div className="w-full flex justify-center bg-gradient-to-b from-[#000] to-[#111111]">
      <div className="flex flex-col items-center max-w-screen-xl w-full py-10 pb-16 px-2">
        <div className="flex w-full gap-5 sm:gap-0 flex-col sm:flex-row sm:justify-between justify-center items-center sm:items-start">
          {/* Logo */}
          <h2>
            <img src={miraiLogo} alt="" className="w-[80px]" />
          </h2>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {/* Info */}
            <div className="text-[14px] sm:text-[18px] flex gap-2 text-[#aaa]">
              <a href="https://www.vsai.pro/" target="_blank" rel="noreferrer">
                <span className="hover:text-[#fff] cursor-pointer">
                  Website
                </span>
              </a>
              <a
                href="https://docs.vsai.pro/"
                target="_blank"
                rel="noreferrer"
              >
                <span className="hover:text-[#fff] cursor-pointer">Docs</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex sm:justify-end justify-center gap-4">
              <a
                href="https://t.me/VisionAIETH"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={telegram}
                  alt=""
                  className="w-[20px] sm:w-[30px] hover:scale-[1.05] "
                />
              </a>
              <a
                href="https://twitter.com/VisionAIETH"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={twitter}
                  alt=""
                  className="w-[20px] sm:w-[30px] hover:scale-[1.05] "
                />
              </a>
              <a
                href="https://www.dextools.io/app/en/ether/pair-explorer/0xcb28a1555d2f18174ebc13402bd80d8396265c21"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={dextools}
                  alt=""
                  className="w-[15px] sm:w-[25px] hover:scale-[1.05] "
                />
              </a>

            </div>
          </div>
        </div>

        {/* All right reserved */}
        <span className="mt-5 text-[13px] text-[#676767]">
          © 2024 VisionAI . All Rights Reserved.
        </span>
      </div>
    </div>
  );
};

export default Footer;
