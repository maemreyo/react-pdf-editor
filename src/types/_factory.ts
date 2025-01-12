// File: File/types/_factory.ts
import { ContentData, ContentElement } from "./_content";
import { IRenderStrategy, IStateManagementStrategy } from "./_strategies";

/**
 * Enum định nghĩa các loại content được hỗ trợ.
 */
export enum ContentType {
  IMAGE = "image",
  TEXT = "text",
  QRCODE = "qrcode",
}

/**
 * Interface cơ bản cho factory, chịu trách nhiệm tạo các ContentElement.
 */
export interface IContentElementFactory {
  /**
   * Tạo một ContentElement mới dựa trên data đầu vào.
   * @param data - Dữ liệu đầu vào để tạo ContentElement.
   * @returns Một ContentElement mới.
   * @throws {ContentFactoryError} Nếu có lỗi xảy ra trong quá trình tạo.
   */
  create(data: ContentData): ContentElement;
}

/**
 * Interface cho factory configuration, cung cấp các thông tin cấu hình cho factory.
 */
export interface IContentConfiguration {
  /**
   * Lấy các option cấu hình cho factory.
   * @returns Các option cấu hình.
   */
  getOptions(): FactoryOptions;

  /**
   * Cập nhật option cấu hình cho factory.
   * @param options - Các option cấu hình mới.
   * @throws {ConfigurationError} Nếu có lỗi xảy ra trong quá trình configuration.
   */
  setOptions(options: FactoryOptions): void;
}

/**
 * Interface cho plugin system (sẽ được triển khai chi tiết sau).
 */
export interface IContentPlugin {
  // Placeholder for future plugin features
}

/**
 * Error cơ bản cho các lỗi liên quan đến ContentFactory.
 */
export class ContentFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentFactoryError";
  }
}

/**
 * Error cho các lỗi liên quan đến validation.
 */
export class ValidationError extends ContentFactoryError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Error cho các lỗi liên quan đến configuration.
 */
export class ConfigurationError extends ContentFactoryError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * Hệ thống registry đơn giản cho ContentFactory.
 */
export class ContentFactoryRegistry {
  private factories: Map<ContentType, IContentElementFactory> = new Map();

  /**
   * Đăng ký một factory cho một loại content.
   * @param type - Loại content.
   * @param factory - Factory tương ứng.
   */
  registerFactory(type: ContentType, factory: IContentElementFactory): void {
    this.factories.set(type, factory);
  }

  /**
   * Lấy factory tương ứng với một loại content.
   * @param type - Loại content.
   * @returns Factory tương ứng hoặc undefined nếu không tìm thấy.
   */
  getFactory(type: ContentType): IContentElementFactory | undefined {
    return this.factories.get(type);
  }

  /**
   * Hủy đăng ký factory cho một loại content.
   * @param type - Loại content.
   */
  unregisterFactory(type: ContentType): void {
    this.factories.delete(type);
  }
}

/**
 * Kiểu dữ liệu định nghĩa rule format cho validation.
 * @example
 * ```typescript
 * {
 *  required: true,
 *  minLength: 3,
 *  maxLength: 10,
 *  pattern: /^[a-zA-Z]+$/,
 *  custom: (value, context) => { ... } // Custom validator function
 * }
 * ```
 */
export type ValidationRules = {
  [key: string]: any | ((value: any, context?: any) => boolean | string); // Allow custom validator functions
};

// ... other code

/**
 * Interface cho validation layer, chịu trách nhiệm validate dữ liệu đầu vào.
 */
export interface IContentValidation {
  /**
   * Validate dữ liệu đầu vào.
   * @param data - Dữ liệu cần validate.
   * @param rules - Các rule validate.
   * @param context - (Optional) Context object for validation.
   * @returns `true` nếu dữ liệu hợp lệ, ngược lại `false`.
   * @throws {ValidationError} Nếu dữ liệu không hợp lệ.
   */
  validate(data: ContentData, rules: ValidationRules, context?: any): boolean; // Add context parameter
}

/**
 * Kiểu dữ liệu định nghĩa các options có thể cấu hình cho factory.
 */
export type FactoryOptions = {
  validate?: boolean; // Có thực hiện validate hay không, mặc định là true
  validationRules?: { [key in ContentType]?: ValidationRules }; // Validation rules cho từng loại content
  plugins?: IContentPlugin[]; // Plugins to be registered
};

// =============================================================================
// ============================= Plugin interfaces =============================
// =============================================================================

/**
 * Interface cho plugin system.
 */
export interface IContentPlugin {
  /**
   * (Optional) Called when the plugin is registered with the ContentFactory.
   * @param factory - The ContentFactory instance.
   */
  init?(factory: IContentElementFactory): void;

  /**
   * (Optional) Called before a ContentElement is created.
   * @param data - The ContentData for the element.
   */
  apply?(data: ContentData): void;

  /**
   * (Optional) Called when the plugin is unregistered from the ContentFactory.
   */
  dispose?(): void;
}

/**
 * Base interface for different types of plugins.
 */
interface IPlugin extends IContentPlugin {
  name: string;
}

/**
 * Plugin for custom validation rules.
 */
export interface IValidationPlugin extends IPlugin {
  type: "validation";
  validator: IContentValidation;
}

/**
 * Plugin for custom rendering logic.
 */
export interface IRenderingPlugin extends IPlugin {
  type: "rendering";
  renderStrategy: IRenderStrategy;
}

/**
 * Plugin for custom element behaviors.
 */
export interface IBehaviorPlugin extends IPlugin {
  type: "behavior";
  stateManagementStrategy?: IStateManagementStrategy;
  // Add other behavior-related strategies as needed
}

/**
 * Plugin for helper functions.
 */
export interface IUtilityPlugin extends IPlugin {
  type: "utility";
  // Define utility methods as needed
}
