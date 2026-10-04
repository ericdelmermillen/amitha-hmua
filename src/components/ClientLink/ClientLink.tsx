"use client";

import type { ReactNode, MouseEvent } from "react";
import { useAppContext } from "@/hooks/hooks";
import { isModifiedClick } from "@/utils/utils";
import Link from "next/link";

interface ClientLinkProps {
  href: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children?: ReactNode;
  scroll?: boolean;
  skipIsLoading? : boolean;
}

const ClientLink = ({
  href,
  className = "",
  onClick, 
  children,
  scroll = false,
  skipIsLoading = false,
}: ClientLinkProps ) => {

  const { setAppIsLoading } = useAppContext();


  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isModifiedClick(e) && !skipIsLoading) {
      setAppIsLoading(true);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleLinkClick}
      scroll={scroll}
    >
      {children}
    </Link>
  );
};

export default ClientLink;