import Navbar from "./Navbar";

function AppLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Navbar />
        {children}
      </div>
    </div>
  );
}

export default AppLayout;