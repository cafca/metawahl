import { NavLink, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import Search from "@/components/Search";
import useIsMobile from "@/hooks/useIsMobile";

function DesktopMenu() {
  return (
    <div className="ui menu">
      <div className="ui container">
        <Link to="/" className="header item">
          Metawahl
        </Link>
        <NavLink
          to="/wahlen/"
          className={({ isActive }) => `item${isActive ? " active" : ""}`}
        >
          Wahlen
        </NavLink>
        <NavLink
          to="/themen/"
          className={({ isActive }) => `item${isActive ? " active" : ""}`}
        >
          Themen
        </NavLink>
        <NavLink
          to="/daten/"
          className={({ isActive }) => `item${isActive ? " active" : ""}`}
        >
          Daten
        </NavLink>
        <Search className="small right aligned item" large />
      </div>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="ui fluid menu">
      <div
        ref={ref}
        className={`ui dropdown item${open ? " active visible" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        Metawahl
        <i className="dropdown icon" />
        <div className={`menu transition${open ? " visible" : " hidden"}`}>
          <Link to="/" className="item" onClick={() => setOpen(false)}>
            Einführung
          </Link>
          <Link to="/wahlen/" className="item" onClick={() => setOpen(false)}>
            Wahlen
          </Link>
          <Link to="/themen/" className="item" onClick={() => setOpen(false)}>
            Themen
          </Link>
        </div>
      </div>
      <Search className="small right aligned item" large />
    </div>
  );
}

export function Header() {
  const mobile = useIsMobile(600);
  return mobile ? <MobileMenu /> : <DesktopMenu />;
}

export default Header;
