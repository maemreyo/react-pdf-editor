import { ContentElement, ContentData } from "../types/_content";
import {
  ContentType,
  IContentElementFactory,
  IContentValidation,
  IContentConfiguration,
  ContentFactoryRegistry,
  ValidationRules,
  FactoryOptions,
  ValidationError,
  IContentPlugin,
} from "@/types/_factory";
import { ImageElement, TextElement, QRCodeElement } from "./ContentElements";

import { DIContainer } from "../core/di/Container";
import { DI_TOKENS } from "../core/di/tokens";
import {
  IRenderStrategy,
  ILoadingStrategy,
  IErrorHandlingStrategy,
  IStateManagementStrategy,
} from "../types/_strategies";

import {
  ContentError,
  ContentValidationError,
} from "../core/errors/ContentErrors";
import { ContentStateManager } from "../core/state/ContentStateManager";

// Default implementation for IContentValidation
export class DefaultContentValidation implements IContentValidation {
  validate(data: ContentData, rules: ValidationRules, context?: any): boolean {
    if (!rules) return true;

    for (const key in rules) {
      const ruleValue = rules[key];
      const dataValue = data[key as keyof ContentData];
      if (typeof ruleValue === "function") {
        const result = ruleValue(dataValue, context);
        if (typeof result === "string") {
          throw new ContentValidationError(result);
        } else if (!result) {
          throw new ContentValidationError(
            `Field ${key} failed custom validation`,
          );
        }
      } else {
        switch (key) {
          case "required":
            if (
              ruleValue &&
              (dataValue === undefined ||
                dataValue === null ||
                dataValue === "")
            ) {
              throw new ContentValidationError(`Field ${key} is required`);
            }
            break;
          case "minLength":
            if (typeof dataValue === "string" && dataValue.length < ruleValue) {
              throw new ContentValidationError(
                `Field ${key} must be at least ${ruleValue} characters long`,
              );
            }
            break;
          case "maxLength":
            if (typeof dataValue === "string" && dataValue.length > ruleValue) {
              throw new ContentValidationError(
                `Field ${key} must be no more than ${ruleValue} characters long`,
              );
            }
            break;
          case "pattern":
            if (
              typeof dataValue === "string" &&
              !(ruleValue as RegExp).test(dataValue)
            ) {
              throw new ContentValidationError(
                `Field ${key} does not match the pattern`,
              );
            }
            break;
          default:
            console.warn(`Unknown validation rule: ${key}`);
            break;
        }
      }
    }

    return true;
  }
}

// Default implementation for IContentConfiguration
export class DefaultContentConfiguration implements IContentConfiguration {
  private options: FactoryOptions = {
    validate: true,
    validationRules: {
      // [ContentType.IMAGE]: {
      //   required: true,
      //   src: { required: true },
      // },
      [ContentType.TEXT]: {
        required: true,
        value: { required: true, minLength: 1 },
      },
      [ContentType.QRCODE]: {
        required: true,
        link: { required: true },
        size: { required: false },
        dpi: { required: false },
      },
    },
  };

  getOptions(): FactoryOptions {
    return this.options;
  }

  setOptions(options: FactoryOptions): void {
    // Thêm logic validate options nếu cần thiết
    if (options.validationRules) {
      // Có thể validate các rule trong options.validationRules
    }
    this.options = { ...this.options, ...options };
  }
}

/**
 * Manages the registration and application of plugins.
 */
export class PluginRegistry {
  private plugins: IContentPlugin[] = [];

  constructor(private factory: IContentElementFactory) {}

  /**
   * Registers a plugin.
   * @param plugin - The plugin to register.
   */
  registerPlugin(plugin: IContentPlugin): void {
    this.plugins.push(plugin);
    if (plugin.init) {
      plugin.init(this.factory);
    }
  }

  /**
   * Unregisters a plugin.
   * @param plugin - The plugin to unregister.
   */
  unregisterPlugin(plugin: IContentPlugin): void {
    const index = this.plugins.indexOf(plugin);
    if (index > -1) {
      this.plugins.splice(index, 1);
      if (plugin.dispose) {
        plugin.dispose();
      }
    }
  }

  /**
   * Applies all registered plugins to the given data.
   * @param data - The ContentData to apply plugins to.
   */
  applyPlugins(data: ContentData): void {
    this.plugins.forEach((plugin) => {
      if (plugin.apply) {
        plugin.apply(data);
      }
    });
  }
}

// Updated ContentFactory using the new interfaces and registry
export class ContentFactory implements IContentElementFactory {
  private registry: ContentFactoryRegistry;
  private validator: IContentValidation;
  private config: IContentConfiguration;
  private pluginRegistry: PluginRegistry;
  private diContainer: DIContainer;

  constructor(
    registry: ContentFactoryRegistry,
    validator: IContentValidation,
    config: IContentConfiguration,
  ) {
    this.diContainer = DIContainer.getInstance();
    this.registry = registry;
    this.validator = validator;
    this.config = config;
    this.pluginRegistry = new PluginRegistry(this);

    // Register default factories
    this.registry.registerFactory(ContentType.IMAGE, new ImageElementFactory());
    this.registry.registerFactory(ContentType.TEXT, new TextElementFactory());
    this.registry.registerFactory(
      ContentType.QRCODE,
      new QRCodeElementFactory(),
    );

    // Initialize plugins from config
    const options = this.config.getOptions();
    if (options.plugins) {
      options.plugins.forEach((plugin) => this.registerPlugin(plugin));
    }
  }

  create(data: ContentData): ContentElement {
    // Apply plugins
    this.pluginRegistry.applyPlugins(data);

    const factory = this.registry.getFactory(data.type);
    if (!factory) {
      throw new Error(`No factory registered for content type: ${data.type}`);
    }

    const options = this.config.getOptions();
    if (options.validate) {
      const rules = options.validationRules?.[data.type];
      if (rules) {
        try {
          this.validator.validate(data, rules);
        } catch (error) {
          if (error instanceof ContentError) {
            throw new ContentValidationError(
              `Validation failed for ${data.type} element: ${error.message}`,
              {
                data,
                rules,
                originalError: error,
              },
            );
          }
          throw error;
        }
      }
    }

    // Resolve strategies from DI container
    const renderStrategy = this.diContainer.resolve<IRenderStrategy>(
      DI_TOKENS.RENDER_STRATEGY,
    );
    const loadingStrategy = this.diContainer.resolve<ILoadingStrategy>(
      DI_TOKENS.LOADING_STRATEGY,
    );
    const errorHandlingStrategy =
      this.diContainer.resolve<IErrorHandlingStrategy>(
        DI_TOKENS.ERROR_HANDLING_STRATEGY,
      );
    const stateManagementStrategy =
      this.diContainer.resolve<IStateManagementStrategy>(
        DI_TOKENS.STATE_MANAGEMENT_STRATEGY,
      );

    if (data.type === ContentType.IMAGE) {
      const element = new ImageElement(
        data,
        renderStrategy,
        loadingStrategy,
        errorHandlingStrategy,
        stateManagementStrategy,
      );
      return element;
    } else if (data.type === ContentType.TEXT) {
      const element = new TextElement(
        data,
        renderStrategy,
        loadingStrategy,
        errorHandlingStrategy,
        stateManagementStrategy,
      );
      return element;
    } else if (data.type === ContentType.QRCODE) {
      const element = new QRCodeElement(
        data,
        renderStrategy,
        loadingStrategy,
        errorHandlingStrategy,
        stateManagementStrategy,
      );
      return element;
    } else {
      throw new Error(`Unsupported content type: ${data.type}`);
    }
  }

  registerPlugin(plugin: IContentPlugin): void {
    this.pluginRegistry.registerPlugin(plugin);
  }
}

// Factory for creating ImageElement
class ImageElementFactory implements IContentElementFactory {
  create(data: ContentData): ContentElement {
    const diContainer = DIContainer.getInstance();
    const renderStrategy = diContainer.resolve<IRenderStrategy>(
      DI_TOKENS.RENDER_STRATEGY,
    );
    const loadingStrategy = diContainer.resolve<ILoadingStrategy>(
      DI_TOKENS.LOADING_STRATEGY,
    );
    const errorHandlingStrategy = diContainer.resolve<IErrorHandlingStrategy>(
      DI_TOKENS.ERROR_HANDLING_STRATEGY,
    );
    const stateManagementStrategy =
      diContainer.resolve<IStateManagementStrategy>(
        DI_TOKENS.STATE_MANAGEMENT_STRATEGY,
      );
    return new ImageElement(
      data,
      renderStrategy,
      loadingStrategy,
      errorHandlingStrategy,
      stateManagementStrategy,
    );
  }
}

// Factory for creating TextElement
class TextElementFactory implements IContentElementFactory {
  create(data: ContentData): ContentElement {
    const diContainer = DIContainer.getInstance();
    const renderStrategy = diContainer.resolve<IRenderStrategy>(
      DI_TOKENS.RENDER_STRATEGY,
    );
    const loadingStrategy = diContainer.resolve<ILoadingStrategy>(
      DI_TOKENS.LOADING_STRATEGY,
    );
    const errorHandlingStrategy = diContainer.resolve<IErrorHandlingStrategy>(
      DI_TOKENS.ERROR_HANDLING_STRATEGY,
    );
    const stateManagementStrategy =
      diContainer.resolve<IStateManagementStrategy>(
        DI_TOKENS.STATE_MANAGEMENT_STRATEGY,
      );
    return new TextElement(
      data,
      renderStrategy,
      loadingStrategy,
      errorHandlingStrategy,
      stateManagementStrategy,
    );
  }
}

// Factory for creating QRCodeElement
class QRCodeElementFactory implements IContentElementFactory {
  create(data: ContentData): ContentElement {
    const diContainer = DIContainer.getInstance();
    const renderStrategy = diContainer.resolve<IRenderStrategy>(
      DI_TOKENS.RENDER_STRATEGY,
    );
    const loadingStrategy = diContainer.resolve<ILoadingStrategy>(
      DI_TOKENS.LOADING_STRATEGY,
    );
    const errorHandlingStrategy = diContainer.resolve<IErrorHandlingStrategy>(
      DI_TOKENS.ERROR_HANDLING_STRATEGY,
    );
    const stateManagementStrategy =
      diContainer.resolve<IStateManagementStrategy>(
        DI_TOKENS.STATE_MANAGEMENT_STRATEGY,
      );
    return new QRCodeElement(
      data,
      renderStrategy,
      loadingStrategy,
      errorHandlingStrategy,
      stateManagementStrategy,
    );
  }
}
