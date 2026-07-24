"use client";

import type { ReactNode } from "react";
// import { usePathname } from "next/navigation";
import Link from "next/link";
import "./NavLink.scss";

interface NavLinkProps {
  children?: ReactNode;
  href: string;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  // const path = usePathname();
  
  return (
    <Link
      href={href}
    >
      {children}
    </Link>
  );
};

export default NavLink;