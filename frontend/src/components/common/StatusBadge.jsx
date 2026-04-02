function StatusBadge({ healthy }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: "bold",
        background: healthy ? "#dcfce7" : "#fee2e2",
        color: healthy ? "#166534" : "#991b1b",
      }}
    >
      {healthy ? "Healthy" : "Unreachable"}
    </span>
  );
}

export default StatusBadge;
