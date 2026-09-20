"use client";

import { useAppContext } from "@/hooks/hooks";
import { scrollToTop } from "@/utils/utils";
import AddIcon from "@/assets/icons/AddIcon";
import UpIcon from "@/assets/icons/UpIcon";
import "./FloatingButton.scss";

const FloatingButton = () => {
  const { 
    isLoggedIn,
    showFloatingButton,
    handleNavigateToAddShoot
   } = useAppContext();

  return (
    <button className={`floatingButton ${isLoggedIn && showFloatingButton
      ? "addShoot"
      : !showFloatingButton
      ? "hide"
      : "toTop" }`}
      onClick={isLoggedIn 
        ? handleNavigateToAddShoot
        : scrollToTop}
      type="button"
    >
      {isLoggedIn 

        ? <AddIcon className="floatingButton__add" strokeClassName="floatingButton__add-stroke"/>
        : <UpIcon className="floatingButton__up" strokeClassName="floatingButton__up-stroke"/>
          
      }
    </button>
  );
};

export default FloatingButton;