import { DIContainer } from "./Container";
import { DI_TOKENS } from "./tokens";
import {
  DefaultRenderStrategy,
  DefaultLoadingStrategy,
  DefaultErrorHandlingStrategy,
  DefaultStateManagementStrategy,
} from "../../strategies/DefaultStrategies";
import {
  DefaultContentConfiguration,
  DefaultContentValidation,
} from "@/components/ContentFactory";
import { ContentFactoryRegistry } from "@/types";
import { ErrorHandler } from "../../core/errors/ErrorHandler";

export class StrategyProvider {
  static initialize(): void {
    const container = DIContainer.getInstance();

    try {
      // Register default strategies
      container.register(
        DI_TOKENS.RENDER_STRATEGY,
        new DefaultRenderStrategy(),
      );
      container.register(
        DI_TOKENS.LOADING_STRATEGY,
        new DefaultLoadingStrategy(),
      );
      container.register(
        DI_TOKENS.ERROR_HANDLING_STRATEGY,
        new DefaultErrorHandlingStrategy(),
      );
      container.register(
        DI_TOKENS.STATE_MANAGEMENT_STRATEGY,
        new DefaultStateManagementStrategy(),
      );

      // Register ContentFactory dependencies
      container.register(
        DI_TOKENS.CONTENT_VALIDATION,
        new DefaultContentValidation(),
      );
      container.register(
        DI_TOKENS.CONTENT_CONFIGURATION,
        new DefaultContentConfiguration(),
      );
      container.register(
        DI_TOKENS.CONTENT_REGISTRY,
        new ContentFactoryRegistry(),
      );
    } catch (error) {
      ErrorHandler.handle(error as Error);
    }
  }
}
