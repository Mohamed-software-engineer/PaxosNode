import { motion } from "framer-motion";

function ClusterVisualization({ nodes, nodeStates, selectedNodeId, pendingValue }) {
  const activeNodeId = Number(selectedNodeId || 1);
  const centerX = 300;
  const centerY = 180;
  const radius = 120;

  const providerNode = nodes.find((n) => nodeStates[n.id]?.isProvider);
  const providerNodeId = providerNode?.id;

  const points = nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / nodes.length - Math.PI / 2;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      state: nodeStates[node.id],
    };
  });

  const activePoint = points.find((p) => p.id === activeNodeId);

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
        {providerNodeId && (
          <span style={{ marginLeft: "12px", color: "#2563eb", fontWeight: "bold" }}>
            Provider: Node {providerNodeId}
          </span>
        )}
      </p>

      <svg viewBox="0 0 600 360" style={{ width: "100%", height: "360px" }}>
        {points.map((point) =>
          point.id !== activeNodeId ? (
            <line
              key={`line-${point.id}`}
              x1={activePoint?.x}
              y1={activePoint?.y}
              x2={point.x}
              y2={point.y}
              stroke={point.id === providerNodeId ? "#3b82f6" : "#cbd5e1"}
              strokeWidth={point.id === providerNodeId ? "3" : "2"}
              strokeDasharray={point.id === providerNodeId ? "0" : "6 6"}
            />
          ) : null
        )}

        {points.map((point) =>
          point.id !== activeNodeId && point.state?.healthy ? (
            <motion.circle
              key={`pulse-${point.id}`}
              r="5"
              fill={point.id === providerNodeId ? "#3b82f6" : "#2563eb"}
              initial={{ cx: activePoint?.x, cy: activePoint?.y, opacity: 0.3 }}
              animate={{
                cx: [activePoint?.x, point.x],
                cy: [activePoint?.y, point.y],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: point.id * 0.2,
              }}
            />
          ) : null
        )}

        {points.map((point) => {
          const healthy = !!point.state?.healthy;
          const chosen = !!point.state?.isChosen;
          const isProvider = point.id === providerNodeId;
          const isActive = point.id === activeNodeId;

          return (
            <g key={point.id}>
              {isProvider && (
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

              <motion.circle
                cx={point.x}
                cy={point.y}
                r="36"
                fill={isActive ? "#2563eb" : isProvider ? "#dbeafe" : "white"}
                stroke={
                  isProvider
                    ? "#3b82f6"
                    : chosen
                    ? "#22c55e"
                    : healthy
                    ? "#94a3b8"
                    : "#ef4444"
                }
                strokeWidth={isProvider ? "4" : "4"}
                animate={
                  isActive
                    ? { scale: [1, 1.06, 1] }
                    : isProvider
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
                fill={isActive || isProvider ? "#1e3a8a" : "#0f172a"}
              >
                N{point.id}
              </text>

              <text
                x={point.x}
                y={point.y + 15}
                textAnchor="middle"
                fontSize="10"
                fill={isActive ? "#dbeafe" : isProvider ? "#2563eb" : "#64748b"}
              >
                {isProvider ? "provider" : healthy ? chosen ? "chosen" : "ready" : "down"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default ClusterVisualization;