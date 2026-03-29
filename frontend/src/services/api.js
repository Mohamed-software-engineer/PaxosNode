import axios from "axios";

export const createApiClient = (baseURL) => {
  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });
};