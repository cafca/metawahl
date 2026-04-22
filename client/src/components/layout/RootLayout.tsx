import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function RootLayout() {
  return (
    <div className="App">
      <Header />
      <main style={{ marginTop: "2em" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
