import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** Scroll to top on every pathname change. RR7 doesn't do this by default. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function RootLayout() {
  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
