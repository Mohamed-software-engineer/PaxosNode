import { createApiClient } from "./api";

export const getNodeHealth = async (baseUrl) => {
  const api = createApiClient(baseUrl);
  const response = await api.get("/api/Paxos/health");
  return response.data;
};

export const getNodeState = async (baseUrl) => {
  const api = createApiClient(baseUrl);
  const response = await api.get("/api/Paxos/state");
  return response.data;
};

export const submitProposal = async (baseUrl, value) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/Paxos/propose", { value });
  return response.data;
};

export const sendPrepare = async (baseUrl, payload) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/Paxos/prepare", payload);
  return response.data;
};

export const sendAccept = async (baseUrl, payload) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/Paxos/accept", payload);
  return response.data;
};

export const sendLearn = async (baseUrl, payload) => {
  const api = createApiClient(baseUrl);
  const response = await api.post("/api/Paxos/learn", payload);
  return response.data;
};