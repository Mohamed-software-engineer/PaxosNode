import { useEffect, useMemo, useState } from "react";
import { NODES } from "../config/nodes";
import { getNodeHealth, getNodeState, submitProposal } from "../services/paxosService";
import SummaryCard from "../components/dashboard/SummaryCard";
import NodeCard from "../components/dashboard/NodeCard";
import ProposalForm from "../components/dashboard/ProposalForm";
import ActivityLog from "../components/dashboard/ActivityLog";
import ClusterVisualization from "../components/dashboard/ClusterVisualization";
import PhaseTimeline from "../components/dashboard/PhaseTimeline";
import ManualPaxosControl from "../components/dashboard/ManualPaxosControl";

function DashboardPage() {
  const [nodeStates, setNodeStates] = useState({});
  const [logs, setLogs] = useState([{ id: 1, text: "Dashboard initialized." }]);
  const [loadingProposal, setLoadingProposal] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState("1");
  const [proposalValue, setProposalValue] = useState("");

  const appendLog = (text) => {
    setLogs((prev) => [{ id: Date.now() + Math.random(), text }, ...prev].slice(0, 30));
  };

  const refreshNode = async (node) => {
    try {
      const [health, state] = await Promise.all([
        getNodeHealth(node.baseUrl),
        getNodeState(node.baseUrl),
      ]);

      setNodeStates((prev) => ({
        ...prev,
        [node.id]: {
          healthy: health?.status === "ok",
          ...state,
        },
      }));
    } catch (error) {
      setNodeStates((prev) => ({
        ...prev,
        [node.id]: {
          healthy: false,
          nodeId: node.id,
          isChosen: false,
          error: error.message,
        },
      }));
      appendLog(`${node.name} unreachable.`);
    }
  };

  const refreshAll = async () => {
    await Promise.all(NODES.map(refreshNode));
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProposalSubmit = async () => {
    if (!proposalValue.trim()) {
      appendLog("Proposal value is empty.");
      return;
    }

    const node = NODES.find((n) => String(n.id) === String(selectedNodeId));
    if (!node) return;

    setLoadingProposal(true);
    try {
      const result = await submitProposal(node.baseUrl, proposalValue.trim());
      appendLog(`Proposal sent from ${node.name}: ${proposalValue.trim()}`);
      appendLog(result?.message || "Proposal completed.");
      await refreshAll();
    } catch (error) {
      appendLog(`Proposal failed from ${node.name}: ${error.message}`);
    } finally {
      setLoadingProposal(false);
    }
  };

  const healthyCount = useMemo(
    () => Object.values(nodeStates).filter((x) => x?.healthy).length,
    [nodeStates]
  );

  const chosenCount = useMemo(
    () => Object.values(nodeStates).filter((x) => x?.isChosen).length,
    [nodeStates]
  );

  const learnedValues = useMemo(() => {
    return [
      ...new Set(
        Object.values(nodeStates)
          .map((x) => x?.learnedValue)
          .filter(Boolean)
      ),
    ];
  }, [nodeStates]);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <SummaryCard title="Total Nodes" value={NODES.length} subtitle="Configured frontend nodes" />
        <SummaryCard title="Healthy Nodes" value={healthyCount} subtitle="From /health endpoint" />
        <SummaryCard title="Chosen Nodes" value={chosenCount} subtitle="Nodes with chosen state" />
        <SummaryCard
          title="Cluster Values"
          value={learnedValues.length ? learnedValues.join(", ") : "—"}
          subtitle="Observed learned values"
        />
      </div>

      {/* Visualization Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 0.6fr",
          gap: "24px",
          marginBottom: "24px",
          alignItems: "start",
        }}
      >
        <ClusterVisualization
          nodes={NODES}
          nodeStates={nodeStates}
          selectedNodeId={selectedNodeId}
          pendingValue={proposalValue}
        />

        <PhaseTimeline nodeStates={nodeStates} />
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {NODES.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              state={nodeStates[node.id]}
              onRefresh={refreshNode}
            />
          ))}
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <ProposalForm
            nodes={NODES}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            value={proposalValue}
            setValue={setProposalValue}
            onSubmit={handleProposalSubmit}
            loading={loadingProposal}
          />

          <ManualPaxosControl
            nodes={NODES}
            onActionComplete={refreshAll}
            appendLog={appendLog}
          />

          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;