import { motion } from "framer-motion";
import StatusBadge from "../common/StatusBadge";
import { formatValue } from "../../utils/formatters";

function NodeCard({ node, state, onRefresh }) {
  const isChosen = state?.isChosen;
  const healthy = !!state?.healthy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: isChosen
          ? "0 0 0 rgba(0,0,0,0)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.4 }}
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: isChosen
          ? "0 0 0 2px rgba(34,197,94,0.25), 0 6px 20px rgba(34,197,94,0.15)"
          : "0 2px 8px rgba(0,0,0,0.08)",
        border: isChosen ? "1px solid #86efac" : "1px solid #e2e8f0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3>{node.name}</h3>
          <p style={{ fontSize: "12px", color: "#64748b" }}>{node.baseUrl}</p>
        </div>

        <motion.div
          animate={healthy ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <StatusBadge healthy={healthy} />
        </motion.div>
      </div>

      <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
        <div><strong>Node ID:</strong> {formatValue(state?.nodeId ?? node.id)}</div>
        <div><strong>Promised #:</strong> {formatValue(state?.promisedProposalNumber)}</div>
        <div><strong>Accepted #:</strong> {formatValue(state?.acceptedProposalNumber)}</div>
        <div><strong>Accepted Value:</strong> {formatValue(state?.acceptedValue)}</div>
        <div><strong>Learned Value:</strong> {formatValue(state?.learnedValue)}</div>
        <div><strong>Chosen:</strong> {state?.isChosen ? "Yes" : "No"}</div>
      </div>

      <button
        onClick={() => onRefresh(node)}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "none",
          background: "#e2e8f0",
          cursor: "pointer",
        }}
      >
        Refresh
      </button>
    </motion.div>
  );
}

export default NodeCard;