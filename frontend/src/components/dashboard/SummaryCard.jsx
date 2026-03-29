import { motion } from "framer-motion";

function SummaryCard({ title, value, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ color: "#64748b", fontSize: "14px" }}>{title}</p>
      <h2 style={{ fontSize: "28px", margin: "10px 0" }}>{value}</h2>
      <p style={{ color: "#94a3b8", fontSize: "12px" }}>{subtitle}</p>
    </motion.div>
  );
}

export default SummaryCard;