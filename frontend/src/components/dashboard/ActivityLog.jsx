import { motion } from "framer-motion";

function ActivityLog({ logs }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h3>Activity Log</h3>
      <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "10px",
              fontSize: "14px",
            }}
          >
            {log.text}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default ActivityLog;