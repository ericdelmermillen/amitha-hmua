"use client";

import { ClientButtonProps } from "@/typing/interfaces";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import "./ClientButton.scss";

const ClientButton = ({ text, variant = "standard", buttonType, modifierClass }: ClientButtonProps) => {
  const { isLoggedIn, handleLogoutUser } = useAppContext();
  const { handleOpenModal, showModal } = useModalContext();
  
  const safeModifierClass = typeof modifierClass === "string" ? modifierClass : "";

  const handleNavigateToEditoBio = ()=> handleOpenModal({ action: "edit", entityType: "bio" });
  
  
  if (isLoggedIn && buttonType === "editBio") {
    return (
      <button
        className={`clientButton ${variant} ${safeModifierClass}`}
        onClick={handleNavigateToEditoBio}
        disabled={showModal}
      >
        {text}
      </button>
    );
  };

  if (isLoggedIn && buttonType === "logOut") {
    return (
      <button
        className={`clientButton ${variant} ${safeModifierClass}`}
        onClick={handleLogoutUser}
        disabled={showModal}
      >
        {text}
      </button>
    );
  };
};

export default ClientButton;