import type { MouseEvent } from "react";
import { ToastType } from "@/typing/types";
import { toast } from "react-toastify";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });  
  removeClassFromDiv("nav", "hide");
};


const addClassToDiv = (divID: string, className: string) => {
  document.getElementById(divID)?.classList.add(className);
};

const removeClassFromDiv = (divID: string, className: string) => {
  document.getElementById(divID)?.classList.remove(className);
};

const isModifiedClick = (
  e: MouseEvent<HTMLAnchorElement>
) => {
  return !!(
    e?.metaKey ||
    e?.ctrlKey ||
    e?.shiftKey ||
    e?.altKey
  );
};


const isValidFirstName = (name: string) => {
  return name.trim().length >= 2;
}

const isValidLastName = (name: string) => {
  return name.trim().length >= 2;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

const isValidSubject = (subject: string) => {
  return subject.trim().length >= 10;
};

const isValidMessage = (message: string) => {
  return message.trim().length >= 25;
};

const staggerToastsByN = (message: string, toastType: ToastType, staggerOffset: number) => {
  setTimeout(() => {
    if (toastType === "default") {
      toast(message);
    } else {
      toast[toastType](message);
    }
  }, MIN_LOADING_INTERVAL * staggerOffset);
};

const splitOnNewLine = (string: string) => {
  return typeof string === "string"
      ? string
          .split(/\r?\n|\\n/)
          .map(line => line.trim())
          .filter(Boolean)
      : [];
};


export {
  scrollToTop,
  addClassToDiv,
  removeClassFromDiv,
  isModifiedClick,
  isValidFirstName,
  isValidLastName,
  isValidEmail,
  isValidSubject,
  isValidMessage,
  staggerToastsByN,
  splitOnNewLine
}