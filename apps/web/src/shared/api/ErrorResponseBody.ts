export interface ErrorResponseBody {
  success: false;
  message: string;
  code?: string;
  data?: unknown;
}
