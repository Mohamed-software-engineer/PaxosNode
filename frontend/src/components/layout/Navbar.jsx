function Navbar() {
  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        padding: "18px 24px",
        borderRadius: "16px",
        marginBottom: "24px",
      }}
    >
      <h1 style={{ margin: 0 }}>Paxos Distributed Dashboard</h1>
      <p style={{ margin: "6px 0 0", color: "#cbd5e1" }}>
        React frontend for observing and controlling Paxos nodes
      </p>
    </div>
  );
}

export default Navbar;