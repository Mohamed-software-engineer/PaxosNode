import { createApiClient } from "./api";

export const getNodeHealth = async (baseUrl) => {
  const api = createApiClient(baseUrl);
  const response = await api.get("/api/paxos/health");
  return response.data;
};

export const getNodeState = async (baseUrl) => {
  const api = createApiClient(baseUrl);
  const response = await api.get("/api/paxos/state");
  return response.data;
};

export const submitProposal = async (baseUrl, value) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/paxos/propose", { value });
  return response.data;
};

export const sendPrepare = async (baseUrl, payload) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/paxos/prepare", payload);
  return response.data;
};

export const sendAccept = async (baseUrl, payload) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/paxos/accept", payload);
  return response.data;
};

export const sendLearn = async (baseUrl, payload) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/paxos/learn", payload);
  return response.data;
};