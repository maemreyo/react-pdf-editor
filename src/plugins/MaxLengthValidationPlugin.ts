import {
  IContentValidation,
  IValidationPlugin,
  ContentData,
  ValidationRules,
  ContentFactory,
  IContentElementFactory,
  ValidationPluginType,
} from "../types";

export class MaxLengthValidationPlugin implements IValidationPlugin {
  name = "MaxLengthValidationPlugin";
  type: ValidationPluginType = "validation";
  validator: IContentValidation;

  constructor(maxLength: number) {
    this.validator = new MaxLengthValidator(maxLength);
  }
  init(factory: IContentElementFactory): void {
    console.log(
      `${this.name} initialized with factory: ${
        (factory as ContentFactory).constructor.name
      }`,
    );
  }
  apply(data: ContentData): void {
    console.log(`${this.name} applied to data for element id: ${data.id}`);
  }
}

export class MaxLengthValidator implements IContentValidation {
  constructor(private maxLength: number) {}

  validate(data: ContentData, rules: ValidationRules): boolean {
    if (rules && rules.maxLength && typeof data.value === "string") {
      if (data.value.length > this.maxLength) {
        throw new Error(`Value exceeds maximum length of ${this.maxLength}`);
      }
    }
    return true;
  }
}
