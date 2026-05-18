import { AxiosError } from "axios";

interface ErrorResponseBody {
  message?: string;
}

function getLeadErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ErrorResponseBody | undefined;

    return responseData?.message ?? "Lead request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Lead request failed";
}

export { getLeadErrorMessage };
