import { ContentError } from "./ContentErrors";

export class ErrorHandler {
  static handle(error: Error): void {
    if (error instanceof ContentError) {
      console.error(`[${error.code}] ${error.message}`, error.details);
      // Add specific handling based on error code, such as:
      // - Logging the error to a remote server.
      // - Displaying a user-friendly error message.
      // - Retrying the operation.
    } else {
      console.error("Unexpected error:", error);
      // Handle unexpected errors, such as:
      // - Logging the error to a remote server.
      // - Displaying a generic error message to the user.
    }
  }
}
