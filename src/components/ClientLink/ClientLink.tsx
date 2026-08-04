"use client";

import type { ReactNode, MouseEvent } from "react";
import { useAppContext } from "@/hooks/hooks";
import { isModifiedClick } from "@/utils/utils";
import Link from "next/link";


interface ClientLinkProps {
  href: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
  scroll?: boolean;
}

const ClientLink = ({
  href,
  className = "",
  onClick, 
  children,
  scroll = false,
}: ClientLinkProps ) => {

  const { setAppIsLoading } = useAppContext();

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      onClick?.(e);
      return;
    };

    setAppIsLoading(true);
    onClick?.(e);
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleLinkClick}
      scroll={false}
    >
      {children}
    </Link>
  );
};

export default ClientLink;