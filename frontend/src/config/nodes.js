const defaultNodes = [
  { id: 1, name: "Node 1", baseUrl: "http://localhost:5001" },
  { id: 2, name: "Node 2", baseUrl: "http://localhost:5002" },
  { id: 3, name: "Node 3", baseUrl: "http://localhost:5003" },
  { id: 4, name: "Node 4", baseUrl: "http://localhost:5004" },
  { id: 5, name: "Node 5", baseUrl: "http://localhost:5005" },
];

function parseEnvNodes(envValue) {
  if (!envValue) return null;

  try {
    const parsed = JSON.parse(envValue);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    console.warn("Invalid VITE_NODES_JSON environment variable, using default nodes.");
  }

  return null;
}

function parseCommaSeparatedNodes(envValue) {
  if (!envValue) return null;

  const urls = envValue.split(",").map(u => u.trim()).filter(Boolean);
  if (urls.length === 0) return null;

  return urls.map((url, index) => ({
    id: index + 1,
    name: `Node ${index + 1}`,
    baseUrl: url,
  }));
}

export const NODES =
  parseEnvNodes(import.meta.env.VITE_NODES_JSON) ||
  parseCommaSeparatedNodes(import.meta.env.VITE_NODE_URLS) ||
  defaultNodes;
