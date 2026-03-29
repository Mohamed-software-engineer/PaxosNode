import { motion } from "framer-motion";

function PhaseTimeline({ nodeStates }) {
  const promisedCount = Object.values(nodeStates).filter(
    (n) =>
      n?.promisedProposalNumber !== undefined &&
      n?.promisedProposalNumber !== null &&
      n?.promisedProposalNumber !== -1
  ).length;

  const acceptedCount = Object.values(nodeStates).filter((n) => n?.acceptedValue).length;
  const learnedCount = Object.values(nodeStates).filter((n) => n?.learnedValue).length;

  const total = Object.keys(nodeStates).length || 5;
  const majority = Math.floor(total / 2) + 1;

  const phases = [
    {
      title: "Prepare",
      text: `${promisedCount} node(s) promised`,
      active: promisedCount >= 1,
      complete: promisedCount >= majority,
    },
    {
      title: "Accept",
      text: `${acceptedCount} node(s) accepted`,
      active: acceptedCount >= 1,
      complete: acceptedCount >= majority,
    },
    {
      title: "Learn",
      text: `${learnedCount} node(s) learned`,
      active: learnedCount >= 1,
      complete: learnedCount >= majority,
    },
  ];

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h3>Consensus Timeline</h3>

      <div style={{ marginTop: "16px", display: "grid", gap: "18px" }}>
        {phases.map((phase, index) => (
          <div key={phase.title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <motion.div
              animate={
                phase.complete
                  ? { scale: [1, 1.08, 1] }
                  : phase.active
                  ? { scale: [1, 1.04, 1] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.6 }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                background: phase.complete
                  ? "#dcfce7"
                  : phase.active
                  ? "#dbeafe"
                  : "#f1f5f9",
                color: phase.complete
                  ? "#166534"
                  : phase.active
                  ? "#1d4ed8"
                  : "#64748b",
              }}
            >
              {index + 1}
            </motion.div>

            <div>
              <div style={{ fontWeight: "bold" }}>{phase.title}</div>
              <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                {phase.text}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                Majority required: {majority}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhaseTimeline;