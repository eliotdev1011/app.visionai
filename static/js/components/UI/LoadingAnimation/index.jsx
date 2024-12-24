import { useContext } from "react";
import styles from "./styles.module.css";
import { AppContext } from "../../../Context/appContext";

const Loading = ({ text }) => {
  const { loadingMsg } = useContext(AppContext);
  return (
    <div className="bg-[#000000b1] z-[1000] flex-col fixed flex justify-center items-center w-full h-screen top-0 left-0 bottom-0 right-0">
      <div className={styles.loader}></div>
      <h2 className="text-[25px] text-[#8FFF00] mt-5">{loadingMsg}...</h2>
    </div>
  );
};

export default Loading;
