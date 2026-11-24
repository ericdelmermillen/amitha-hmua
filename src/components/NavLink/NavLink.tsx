"use client";

import Link from "next/link";
import { type NavLinkProps } from "@/typing/interfaces";
import "./NavLink.scss";

const NavLink = ({ href, children }: NavLinkProps) => {
  
  return (
    <Link href={href}>
      {children}
    </Link>
  );
};

export default NavLink;