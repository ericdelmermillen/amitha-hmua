import { NavPage } from "@/typing/interfaces";
import Instagram from "@/assets/icons/Instagram";

const navPages: NavPage[] = [
  // { 
  //   pageName: "WORK", href: "/work", modifierClass: "--work", icon: null 
  // },
  { 
    pageName: "BIO", href: "/bio", modifierClass: "--bio", icon: null 
  },
  { 
    pageName: "CONTACT", href: "/contact", modifierClass: "--contact", icon: null 
  },
  { 
    pageName: "INSTAGRAM", href: "https://www.instagram.com/amitha_hmua/", modifierClass: "--instagram", icon: Instagram 
  },
];

export { 
  navPages
 };