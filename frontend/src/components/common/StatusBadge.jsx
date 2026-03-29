function StatusBadge({ healthy }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold",
        backgroundColor: healthy ? "#d1fae5" : "#fee2e2",
        color: healthy ? "#065f46" : "#991b1b",
      }}
    >
      {healthy ? "Healthy" : "Unreachable"}
    </span>
  );
}

export default StatusBadge;