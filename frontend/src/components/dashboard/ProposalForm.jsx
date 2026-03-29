import { motion } from "framer-motion";

function ProposalForm({
  nodes,
  selectedNodeId,
  setSelectedNodeId,
  value,
  setValue,
  onSubmit,
  loading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
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
      <h3>Submit Proposal</h3>

      <div style={{ marginTop: "16px" }}>
        <label>Choose proposer node</label>
        <select
          value={selectedNodeId}
          onChange={(e) => setSelectedNodeId(e.target.value)}
          style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "10px" }}
        >
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Proposal Value</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
          style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "10px" }}
        />
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        {loading ? "Submitting..." : "Start Proposal"}
      </motion.button>
    </motion.form>
  );
}

export default ProposalForm;