import { AxiosError } from "axios";

interface ErrorResponseBody {
  message?: string;
}

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ErrorResponseBody | undefined;

    return responseData?.message ?? "Authentication request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication request failed";
}

export { getAuthErrorMessage };

