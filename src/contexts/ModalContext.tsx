"use client";

import { useState, useRef, createContext } from "react";
import { useAppContext } from "@/hooks/hooks";
import { ContextProviderProps, ModalContextValue, ModalData } from "@/typing/interfaces";


const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const ModalContextProvider = ({ children }: ContextProviderProps) => {
  const { setAppIsLoading } = useAppContext();
  
  const [ showModal, setShowModal ] = useState(false);
  
  const [ modalAction, setModalAction ] = useState<string | null>(null);
  const [ modalEntityID, setModalEntityID ] = useState<number | null>(null);
  const [ modalEntityType, setModalEntityType ] = useState<string | null>(null);
  const [ modalEntityName, setModalEntityName ] = useState<string | null>(null);

  const handleOpenModal = ({ e, action, entityType, entityName = null, entityID = null }: ModalData) => {
    e?.preventDefault();
    e?.stopPropagation()
    setShowModal(true);
    setModalAction(action);
    setModalEntityType(entityType);
    setModalEntityName(entityName);
    setModalEntityID(entityID);
  };

  const handleClearModal = (clearAppIsLoading: boolean = false) => {
    setShowModal(false);
    setModalAction(null);
    setModalEntityName(null);
    setModalEntityID(null);
    
    if (clearAppIsLoading) {
      setAppIsLoading(false);
    }
  };

  const contextValues: ModalContextValue = {
    showModal, 
    setShowModal,
    handleClearModal,
    modalAction, 
    setModalAction,
    handleOpenModal,
    modalEntityType, 
    setModalEntityType,
    modalEntityName, 
    setModalEntityName,
    modalEntityID, 
    setModalEntityID
    // modalNameRef,
    // modalEmailRef,
    // modalPhoneRef,
    // modalFormInitialCheckRef,
    // handleSubmitModalForm,
    // modalIsLoading, 
    // setModalIsLoading,
    // modalTextRef,
    // isSubmittingRef
  };

  return (
    <ModalContext.Provider value={contextValues}>
      {children}
    </ModalContext.Provider>
  );
};

export {
  ModalContext,
  ModalContextProvider
};