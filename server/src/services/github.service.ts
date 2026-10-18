import axios from "axios";
import { ApiError } from "../utils/apiError.js";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});

githubApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    // Network error or timeout
    if (!error.response) {
      const isTimeout = error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT";

      return Promise.reject(
        new ApiError(
          isTimeout ? 504 : 503,
          isTimeout
            ? "GitHub API request timed out."
            : "Unable to connect to GitHub.",
        ),
      );
    }

    const status = error.response.status;
    const headers = error.response.headers;
    const message = error.response.data?.message;

    // Distinguish rate limits from other 403 errors.
    const rateLimitRemaining = headers["x-ratelimit-remaining"];
    const rateLimitReset = headers["x-ratelimit-reset"];

    const isRateLimited =
      status === 429 ||
      (status === 403 &&
        (rateLimitRemaining === "0" ||
          message?.toLowerCase().includes("rate limit")));

    if (isRateLimited) {
      const resetAt =
        rateLimitReset && /^\d+$/.test(String(rateLimitReset))
          ? new Date(Number(rateLimitReset) * 1000).toISOString()
          : undefined;

      return Promise.reject(
        new ApiError(
          429,
          resetAt
            ? `GitHub API rate limit reached. Try again after ${resetAt}.`
            : "GitHub API rate limit reached. Please try again later.",
        ),
      );
    }

    if (status === 404) {
      return Promise.reject(
        new ApiError(404, "GitHub user not found."),
      );
    }

    if (status === 401) {
      return Promise.reject(
        new ApiError(503, "GitHub authentication is not configured correctly."),
      );
    }

    return Promise.reject(
      new ApiError(503, "GitHub is temporarily unavailable."),
    );
  },
);

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