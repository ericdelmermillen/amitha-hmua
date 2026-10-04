"use client";

import { type  MouseEvent } from "react";
import { ClientLinkProps } from "@/typing/interfaces";
import { useAppContext } from "@/hooks/hooks";
import { isModifiedClick } from "@/utils/utils";
import Link from "next/link";

const ClientLink = ({
  href,
  className = "",
  onClick, 
  children,
  scroll = false,
}: ClientLinkProps ) => {

  const { setAppIsLoading } = useAppContext();

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isModifiedClick(e)) {
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