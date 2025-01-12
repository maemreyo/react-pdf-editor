export class ContentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = "ContentError";
  }
}

export class ContentRenderError extends ContentError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "RENDER_ERROR", details);
    this.name = "ContentRenderError";
  }
}

export class ContentValidationError extends ContentError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ContentValidationError";
  }
}

export class ContentStateError extends ContentError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "STATE_ERROR", details);
    this.name = "ContentStateError";
  }
}
