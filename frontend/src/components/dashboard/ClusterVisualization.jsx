import { motion, AnimatePresence } from "framer-motion";

const PHASE_COLORS = {
  Prepare: { primary: "#3b82f6", bg: "#dbeafe", label: "blue" },
  Accept: { primary: "#f59e0b", bg: "#fef3c7", label: "amber" },
  Learn: { primary: "#22c55e", bg: "#dcfce7", label: "green" },
  Complete: { primary: "#8b5cf6", bg: "#ede9fe", label: "purple" },
  Failed: { primary: "#ef4444", bg: "#fee2e2", label: "red" },
};

function ClusterVisualization({ nodes, nodeStates, selectedNodeId, pendingValue }) {
  const activeNodeId = Number(selectedNodeId || 1);
  const centerX = 300;
  const centerY = 180;
  const radius = 120;

  const proposerNode = nodes.find((n) => nodeStates[n.id]?.isProposer);
  const proposerNodeId = proposerNode?.id;

  const activePoint = nodes.find((n) => n.id === activeNodeId);
  const activeState = nodeStates[activeNodeId];
  const currentPhase = activeState?.currentPhase || "Idle";
  const phaseColor = PHASE_COLORS[currentPhase];

  const points = nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / nodes.length - Math.PI / 2;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      state: nodeStates[node.id],
    };
  });

  const activePos = points.find((p) => p.id === activeNodeId);
  const isAnimating = ["Prepare", "Accept", "Learn"].includes(currentPhase);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h3>Paxos Cluster Visualization</h3>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
        Selected proposer: Node {activeNodeId} | Pending value: {pendingValue || "—"}
        {proposerNodeId && (
          <span style={{ marginLeft: "12px", color: "#2563eb", fontWeight: "bold" }}>
            Proposer: Node {proposerNodeId}
          </span>
        )}
      </p>

      <AnimatePresence>
        {isAnimating && phaseColor && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: phaseColor.bg,
              color: phaseColor.primary,
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "16px",
              fontWeight: "bold",
              fontSize: "15px",
              textAlign: "center",
              border: `2px solid ${phaseColor.primary}`,
            }}
          >
            {currentPhase === "Prepare" && "Phase 1: Prepare — Proposer requesting promises"}
            {currentPhase === "Accept" && "Phase 2: Accept — Proposer sending value for acceptance"}
            {currentPhase === "Learn" && "Phase 3: Learn — Broadcasting chosen value to all nodes"}
          </motion.div>
        )}
      </AnimatePresence>

      <svg viewBox="0 0 600 360" style={{ width: "100%", height: "360px" }}>
        {points.map((point) =>
          point.id !== activeNodeId ? (
            <line
              key={`line-${point.id}`}
              x1={activePos?.x}
              y1={activePos?.y}
              x2={point.x}
              y2={point.y}
              stroke={point.id === proposerNodeId ? "#3b82f6" : "#cbd5e1"}
              strokeWidth={point.id === proposerNodeId ? "3" : "2"}
              strokeDasharray={point.id === proposerNodeId ? "0" : "6 6"}
            />
          ) : null
        )}

        {isAnimating &&
          activePos &&
          points
            .filter((p) => p.id !== activeNodeId && p.state?.healthy)
            .map((point, idx) => (
              <g key={`msg-${point.id}`}>
                <motion.circle
                  r="6"
                  fill={phaseColor?.primary || "#3b82f6"}
                  initial={{ cx: activePos.x, cy: activePos.y, opacity: 1 }}
                  animate={{
                    cx: [activePos.x, point.x],
                    cy: [activePos.y, point.y],
                    opacity: [1, 0.9, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: idx * 0.15,
                    ease: "easeInOut",
                  }}
                />

                <motion.text
                  fontSize="9"
                  fontWeight="bold"
                  fill={phaseColor?.primary || "#3b82f6"}
                  initial={{ x: activePos.x + 10, y: activePos.y - 10, opacity: 1 }}
                  animate={{
                    x: [activePos.x + 10, (activePos.x + point.x) / 2 + 10],
                    y: [activePos.y - 10, (activePos.y + point.y) / 2 - 10],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: idx * 0.15,
                    ease: "easeInOut",
                  }}
                >
                  {currentPhase}
                </motion.text>
              </g>
            ))}

        {currentPhase === "Complete" &&
          activePos &&
          points
            .filter((p) => p.id !== activeNodeId && p.state?.healthy)
            .map((point, idx) => (
              <g key={`done-${point.id}`}>
                <motion.circle
                  r="6"
                  fill="#8b5cf6"
                  initial={{ cx: point.x, cy: point.y, opacity: 0 }}
                  animate={{
                    cx: [point.x, activePos.x],
                    cy: [point.y, activePos.y],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: 2,
                    delay: idx * 0.1,
                    ease: "easeInOut",
                  }}
                />
              </g>
            ))}

        {points.map((point) => {
          const healthy = !!point.state?.healthy;
          const chosen = !!point.state?.isChosen;
          const isProposer = point.id === proposerNodeId;
          const isActive = point.id === activeNodeId;

          return (
            <g key={point.id}>
              {isProposer && (
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="44"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}

              {isAnimating && isActive && (
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="48"
                  fill="none"
                  stroke={phaseColor?.primary || "#3b82f6"}
                  strokeWidth="3"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              )}

              <motion.circle
                cx={point.x}
                cy={point.y}
                r="36"
                fill={isActive ? (phaseColor?.primary || "#2563eb") : isProposer ? "#dbeafe" : "white"}
                stroke={
                  isProposer
                    ? "#3b82f6"
                    : chosen
                    ? "#22c55e"
                    : healthy
                    ? "#94a3b8"
                    : "#ef4444"
                }
                strokeWidth="4"
                animate={
                  isActive
                    ? { scale: [1, 1.06, 1] }
                    : isProposer
                    ? { scale: [1, 1.04, 1] }
                    : chosen
                    ? { scale: [1, 1.03, 1] }
                    : {}
                }
                transition={{ repeat: Infinity, duration: 1.8 }}
              />

              <text
                x={point.x}
                y={point.y - 4}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill={isActive || isProposer ? "#1e3a8a" : "#0f172a"}
              >
                N{point.id}
              </text>

              <text
                x={point.x}
                y={point.y + 15}
                textAnchor="middle"
                fontSize="10"
                fill={isActive ? "#dbeafe" : isProposer ? "#2563eb" : "#64748b"}
              >
                {isProposer ? "proposer" : healthy ? chosen ? "chosen" : "ready" : "down"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default ClusterVisualization;
