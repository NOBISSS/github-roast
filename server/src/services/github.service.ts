import axios from "axios";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});

// Attach the token to every request.
githubApi.interceptors.request.use((config) => {
  const token = process.env.GITHUB_TOKEN;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getGithubProfile = async (username: string) => {
  const response = await githubApi.get(
    `/users/${encodeURIComponent(username)}`,
  );

  return response.data;
};

export const getGithubRepositories = async (username: string) => {
  const response = await githubApi.get(
    `/users/${encodeURIComponent(username)}/repos`,
    {
      params: {
        sort: "updated",
        direction: "desc",
        per_page: 10,
        type: "owner",
      },
    },
  );

  return response.data;
};

export const getGithubEvents = async (username: string) => {
  const response = await githubApi.get(
    `/users/${encodeURIComponent(username)}/events/public`,
    {
      params: {
        per_page: 30,
      },
    },
  );

  return response.data;
};