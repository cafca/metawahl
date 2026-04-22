import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  external?: boolean;
  className?: string;
};

const base =
  "relative inline-flex items-center rounded-[0.28571429rem] bg-white pl-[4.07142857em] pr-6 py-[0.78571429em] " +
  "text-[0.9rem] font-bold text-ink-muted shadow-[0_0_0_1px_rgba(34,36,38,0.15)_inset] " +
  "hover:bg-black/[0.03] hover:text-ink-strong hover:shadow-[0_0_0_1px_rgba(34,36,38,0.35)_inset]";

const iconBox =
  "absolute left-0 top-0 flex h-full w-[2.57142857em] items-center justify-center " +
  "bg-black/[0.05] border-r border-[rgba(34,36,38,0.1)] rounded-l-[0.28571429rem] [&_svg]:size-4";

export function LabeledIconButton({ href, icon, children, external, className = "" }: Props) {
  const content = (
    <>
      <span className={iconBox}>{icon}</span>
      {children}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`}>
        {content}
      </a>
    );
  }
  return (
    <Link to={href} className={`${base} ${className}`}>
      {content}
    </Link>
  );
}
