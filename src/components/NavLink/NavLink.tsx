"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import "./NavLink.scss";

interface NavLinkProps {
  children?: ReactNode;
  href: string;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  
  return (
    <Link href={href}>
      {children}
    </Link>
  );
};

export default NavLink;