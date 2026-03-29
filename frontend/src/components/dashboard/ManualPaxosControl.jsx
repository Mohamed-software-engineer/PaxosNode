import { useState } from "react";
import { motion } from "framer-motion";
import { sendPrepare, sendAccept, sendLearn } from "../../services/paxosService";

function ManualPaxosControl({ nodes, onActionComplete, appendLog }) {
  const [operation, setOperation] = useState("prepare");
  const [selectedNodeId, setSelectedNodeId] = useState("1");
  const [proposalNumber, setProposalNumber] = useState("");
  const [proposerId, setProposerId] = useState("1");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const selectedNode = nodes.find((n) => String(n.id) === String(selectedNodeId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedNode) return;

    setLoading(true);
    setResponseData(null);

    try {
      let result = null;

      if (operation === "prepare") {
        const payload = {
          proposalNumber: Number(proposalNumber),
          proposerId: Number(proposerId),
        };

        result = await sendPrepare(selectedNode.baseUrl, payload);
        appendLog(
          `Prepare sent to ${selectedNode.name} with proposal #${proposalNumber} from proposer ${proposerId}`
        );
      }

      if (operation === "accept") {
        const payload = {
          proposalNumber: Number(proposalNumber),
          proposerId: Number(proposerId),
          value: value,
        };

        result = await sendAccept(selectedNode.baseUrl, payload);
        appendLog(
          `Accept sent to ${selectedNode.name} with proposal #${proposalNumber}, proposer ${proposerId}, value "${value}"`
        );
      }

      if (operation === "learn") {
        const payload = {
          proposalNumber: Number(proposalNumber),
          value: value,
        };

        result = await sendLearn(selectedNode.baseUrl, payload);
        appendLog(
          `Learn sent to ${selectedNode.name} with proposal #${proposalNumber}, value "${value}"`
        );
      }

      setResponseData(result);

      if (onActionComplete) {
        await onActionComplete();
      }
    } catch (error) {
      setResponseData({ error: error.message });
      appendLog(`Manual ${operation} failed on ${selectedNode.name}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
      <h3>Manual Paxos Control</h3>
      <p style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>
        Manually trigger Paxos phases using the original algorithm endpoints.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: "16px" }}>
          <label>Operation</label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "10px" }}
          >
            <option value="prepare">Prepare</option>
            <option value="accept">Accept</option>
            <option value="learn">Learn</option>
          </select>
        </div>

        <div style={{ marginTop: "16px" }}>
          <label>Target Node</label>
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
          <label>Proposal Number</label>
          <input
            type="number"
            value={proposalNumber}
            onChange={(e) => setProposalNumber(e.target.value)}
            placeholder="Enter proposal number"
            style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "10px" }}
          />
        </div>

        {(operation === "prepare" || operation === "accept") && (
          <div style={{ marginTop: "16px" }}>
            <label>Proposer ID</label>
            <input
              type="number"
              value={proposerId}
              onChange={(e) => setProposerId(e.target.value)}
              placeholder="Enter proposer ID"
              style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "10px" }}
            />
          </div>
        )}

        {(operation === "accept" || operation === "learn") && (
          <div style={{ marginTop: "16px" }}>
            <label>Value</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "10px" }}
            />
          </div>
        )}

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
            background: "#7c3aed",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : `Send ${operation}`}
        </motion.button>
      </form>

      {responseData && (
        <div
          style={{
            marginTop: "18px",
            padding: "12px",
            borderRadius: "10px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
            overflowX: "auto",
          }}
        >
          <strong>Response:</strong>
          <pre style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  );
}

export default ManualPaxosControl;