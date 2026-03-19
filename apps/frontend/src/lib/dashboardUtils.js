export const formatBytes = (value) => {
  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** exponent;

  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export const getFileExtension = (name = "") => {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex === -1 ? "" : name.slice(dotIndex).toLowerCase();
};

export const getErrorMessage = (payload, fallbackMessage) => {
  if (!payload) {
    return fallbackMessage;
  }
  if (typeof payload.error === "string") {
    return payload.error;
  }
  if (typeof payload.error?.message === "string") {
    return payload.error.message;
  }
  return typeof payload.message === "string" ? payload.message : fallbackMessage;
};

export const parseJsonResponse = async (response) => {
  const rawText = await response.text();
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Failed to parse JSON response", error);
    throw new Error("Server returned an invalid response.");
  }
};

export const normalizeAiMode = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "mock") {
    return { id: "mock", label: "Mock" };
  }
  if (normalized === "live" || normalized === "gpt-4o") {
    return { id: "gpt-4o", label: "GPT-4o" };
  }
  return { id: "fallback", label: "Fallback" };
};

export const extractProposalMarkdown = (proposalResult) =>
  proposalResult?.proposal ||
  proposalResult?.markdown ||
  proposalResult?.results?.proposal ||
  "";

export const getBackendFallbackMessage = (statusPayload, apiBaseUrl) =>
  statusPayload?.status === "offline"
    ? statusPayload.details ||
      statusPayload.message ||
      `Offline at ${apiBaseUrl}`
    : `Offline at ${apiBaseUrl}`;
