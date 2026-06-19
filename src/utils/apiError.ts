import { AxiosError, isAxiosError } from "axios";
import type { TFunction } from "i18next";

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractStringMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim().length > 0) {
    return data.trim();
  }

  if (isRecord(data)) {
    const problem = data as ProblemDetails;

    if (problem.detail && problem.detail.trim().length > 0) {
      return problem.detail.trim();
    }

    if (problem.title && problem.title.trim().length > 0) {
      return problem.title.trim();
    }

    if (problem.errors) {
      const messages = Object.values(problem.errors)
        .flat()
        .filter((message) => message.trim().length > 0);

      if (messages.length > 0) {
        return messages.join(", ");
      }
    }

    if (typeof data.message === "string" && data.message.trim().length > 0) {
      return data.message.trim();
    }
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (!isAxiosError(error)) {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return t("errors.unknown");
  }

  const axiosError = error as AxiosError;

  if (!axiosError.response) {
    return t("errors.network");
  }

  const status = axiosError.response.status;
  const extracted = extractStringMessage(axiosError.response.data);

  switch (status) {
    case 401:
      return extracted ?? t("errors.unauthorized");
    case 403:
      return t("errors.forbidden");
    case 404:
      return extracted ?? t("errors.notFound");
    case 409:
      return extracted ?? t("errors.conflict");
    case 400:
      return extracted ?? t("errors.badRequest");
    case 500:
      return extracted ?? t("errors.server");
    default:
      return extracted ?? t("errors.unknown");
  }
}

export function getApiErrorStatus(error: unknown): number | null {
  if (isAxiosError(error) && error.response) {
    return error.response.status;
  }

  return null;
}
