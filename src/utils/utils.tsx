import type { MouseEvent } from "react";

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

export {
  scrollToTop,
  addClassToDiv,
  removeClassFromDiv,
  isModifiedClick
}