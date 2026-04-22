import { NavLink, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function useIsMobile(breakpoint = 600): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return mobile;
}

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
        <div className="right menu">
          <div className="item">
            <div className="ui small icon input searchNoBorder">
              <input type="text" placeholder="Suchen..." aria-label="Suchen" />
              <i className="search icon" />
            </div>
          </div>
        </div>
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
      <div className="right menu">
        <div className="item">
          <div className="ui small icon input searchNoBorder">
            <input type="text" placeholder="Suchen..." aria-label="Suchen" />
            <i className="search icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const mobile = useIsMobile(600);
  return mobile ? <MobileMenu /> : <DesktopMenu />;
}

export default Header;
