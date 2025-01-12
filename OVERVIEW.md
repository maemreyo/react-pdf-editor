# Hướng dẫn sử dụng hệ thống Strategy và Factory

## Giới thiệu

Hệ thống này cung cấp một kiến trúc linh hoạt và dễ mở rộng cho việc quản lý và hiển thị các nội dung (content) khác nhau trong ứng dụng PDF Viewer. Nó được xây dựng dựa trên hai design pattern chính: **Factory Pattern** và **Strategy Pattern**.

- **Factory Pattern:** Giúp tạo các đối tượng `ContentElement` (ví dụ: `ImageElement`, `TextElement`, `QRCodeElement`) một cách dễ dàng và linh hoạt, ẩn đi logic khởi tạo phức tạp.
- **Strategy Pattern:** Cho phép định nghĩa các thuật toán (strategies) khác nhau cho các hành động như rendering, loading, xử lý lỗi và quản lý trạng thái của `ContentElement`, giúp dễ dàng thay đổi hành vi của `ContentElement` mà không cần sửa đổi code của chúng.

Ngoài ra, hệ thống còn hỗ trợ **validation** dữ liệu đầu vào và mở rộng chức năng thông qua **plugin system**.

## Cài đặt

(Bổ sung hướng dẫn cài đặt nếu cần thiết)

## Kiến trúc

Hệ thống bao gồm các thành phần chính sau:

- **`ContentElement`:** Interface đại diện cho các phần tử nội dung (text, image, QR code). Các class cụ thể như `ImageElement`, `TextElement`, `QRCodeElement` implement interface này.
- **`ContentFactory`:** Class chính chịu trách nhiệm tạo các `ContentElement` dựa trên `ContentData` và `ContentType`.
- **`ContentFactoryRegistry`:** Quản lý việc đăng ký và truy xuất các `IContentElementFactory`.
- **`IContentElementFactory`:** Interface cho các factory tạo `ContentElement`.
- **`IContentValidation`:** Interface cho việc validate dữ liệu đầu vào.
- **`DefaultContentValidation`:** Class implement mặc định cho `IContentValidation`.
- **`IContentConfiguration`:** Interface cung cấp cấu hình cho `ContentFactory`.
- **`DefaultContentConfiguration`:** Class implement mặc định cho `IContentConfiguration`.
- **`IRenderStrategy`, `ILoadingStrategy`, `IErrorHandlingStrategy`, `IStateManagementStrategy`:** Các interface định nghĩa các chiến lược (strategies) cho các hành động khác nhau.
- **`DefaultRenderStrategy`, `DefaultLoadingStrategy`, `DefaultErrorHandlingStrategy`, `DefaultStateManagementStrategy`:** Các class implement mặc định cho các chiến lược.
- **`IContentPlugin`:** Interface cho phép mở rộng chức năng của hệ thống thông qua plugin.
- **`PluginRegistry`:** Quản lý việc đăng ký và áp dụng các plugin.
- **Các plugin mẫu:**
    -   **`MaxLengthValidationPlugin`:** Validate độ dài tối đa của text.
    -   **`LogRenderPlugin`:** Log thông tin khi render element.
    -   **`DraggableBehaviorPlugin`:** Cho phép kéo thả element (cần phải làm lại logic).
    -   **`DebugHelperPlugin`:** Cung cấp các hàm debug hữu ích.

## Factory Pattern

### `ContentFactory`

`ContentFactory` là class trung tâm chịu trách nhiệm tạo các `ContentElement`. Nó sử dụng `ContentFactoryRegistry` để lấy `IContentElementFactory` tương ứng với `ContentType` của `ContentData`.

**Cách sử dụng:**

```typescript
import { ContentFactory, ContentFactoryRegistry, DefaultContentValidation, DefaultContentConfiguration, ContentType } from "./path-to-components-and-types";

const contentFactory = new ContentFactory(
  new ContentFactoryRegistry(),
  new DefaultContentValidation(),
  new DefaultContentConfiguration()
);

const textData = {
  type: ContentType.TEXT,
  id: "text-1",
  x: 100,
  y: 100,
  value: "Hello, world!",
};

const textElement = contentFactory.create(textData);

const imageData = {
    type: ContentType.IMAGE,
    id: "image-1",
    x: 10,
    y: 10,
    src: "https://placehold.co/150x150/png",
  };
  const imageElement = contentFactory.create(imageData);

  const qrCodeData = {
    type: ContentType.QRCODE,
    id: "qrcode-1",
    x: 200,
    y: 200,
    link: "https://example.com",
    size: 50,
    dpi: 300,
  };
  const qrCodeElement = contentFactory.create(qrCodeData);
```

### `ContentFactoryRegistry`

`ContentFactoryRegistry` quản lý việc đăng ký và truy xuất các `IContentElementFactory`. `ContentFactory` sử dụng nó để lấy factory tương ứng với `ContentType`.

**Cách đăng ký factory mới:**

```typescript
import { ContentFactoryRegistry, ContentType, IContentElementFactory, ContentElement, ContentData } from "./path-to-components-and-types";
import { MyCustomElement } from "./MyCustomElement";

// 1. Tạo một class implement IContentElementFactory
class MyCustomElementFactory implements IContentElementFactory {
  create(data: ContentData): ContentElement {
    return new MyCustomElement(data);
  }
}

// 2. Đăng ký factory với ContentFactoryRegistry
const registry = new ContentFactoryRegistry();
registry.registerFactory(ContentType.MY_CUSTOM_TYPE, new MyCustomElementFactory());

// 3. (Optional) Cập nhật ContentType enum
export enum ContentType {
  IMAGE = "image",
  TEXT = "text",
  QRCODE = "qrcode",
  MY_CUSTOM_TYPE = "my_custom_type"
}
```

## Strategy Pattern

### Strategy Interfaces

- **`IRenderStrategy`:** Định nghĩa phương thức `render` để vẽ `ContentElement` lên canvas.
- **`ILoadingStrategy`:** Định nghĩa phương thức `handleLoading` để xử lý trạng thái loading của `ContentElement`.
- **`IErrorHandlingStrategy`:** Định nghĩa phương thức `handleError` để xử lý lỗi của `ContentElement`.
- **`IStateManagementStrategy`:** Định nghĩa các phương thức `getState` và `setState` để quản lý trạng thái của `ContentElement`.

### Default Strategies

Hệ thống cung cấp các default strategy cho các hành động trên:

- **`DefaultRenderStrategy`:** Cung cấp logic render cơ bản cho `TextElement`, `ImageElement`, và `QRCodeElement`.
- **`DefaultLoadingStrategy`:** Hiển thị placeholder "Loading..." khi `ContentElement` đang loading.
- **`DefaultErrorHandlingStrategy`:** Hiển thị placeholder "Error" khi `ContentElement` gặp lỗi.
- **`DefaultStateManagementStrategy`:** Sử dụng `ContentElement.getData()` và `ContentElement.update()` để quản lý trạng thái.

### Sử dụng Strategies trong `ContentElement`

Các `ContentElement` nhận các strategy object thông qua constructor và sử dụng chúng trong các phương thức tương ứng:

```typescript
// Ví dụ trong TextElement
export class TextElement implements ContentElement {
  // ...

  constructor(
    data: ContentData,
    private renderStrategy: IRenderStrategy = new DefaultRenderStrategy(),
    private loadingStrategy: ILoadingStrategy = new DefaultLoadingStrategy(),
    private errorHandlingStrategy: IErrorHandlingStrategy = new DefaultErrorHandlingStrategy(),
    private stateManagementStrategy: IStateManagementStrategy = new DefaultStateManagementStrategy(),
  ) {
    // ...
  }

  async render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    // Sử dụng renderStrategy để render
    await this.renderStrategy.render(this, ctx, canvasWidth, canvasHeight);
  }

  // ...
}
```

### Tạo và sử dụng custom strategy

Bạn có thể tạo các custom strategy bằng cách implement các interface `IRenderStrategy`, `ILoadingStrategy`, `IErrorHandlingStrategy`, `IStateManagementStrategy`.

**Ví dụ tạo custom `RenderStrategy`:**

```typescript
import { IRenderStrategy, ContentElement } from "./types";

class MyCustomRenderStrategy implements IRenderStrategy {
  async render(
    element: ContentElement,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    // Logic render custom của bạn
    console.log("Rendering with MyCustomRenderStrategy");
    // ...
  }
}
```

**Cách sử dụng custom strategy:**

```typescript
// Khi tạo ContentElement
const myCustomRenderStrategy = new MyCustomRenderStrategy();
const textElement = new TextElement(
    textData,
    myCustomRenderStrategy, // Truyền custom strategy vào constructor
    new DefaultLoadingStrategy(),
    new DefaultErrorHandlingStrategy(),
    new DefaultStateManagementStrategy()
);
```

## Validation

Hệ thống cung cấp cơ chế validate dữ liệu đầu vào thông qua `IContentValidation` interface và `DefaultContentValidation` class.

### `IContentValidation`

Interface `IContentValidation` định nghĩa phương thức `validate` để kiểm tra tính hợp lệ của dữ liệu.

```typescript
interface IContentValidation {
  validate(data: ContentData, rules: ValidationRules, context?: any): boolean;
}
```

### `ValidationRules`

`ValidationRules` là một object định nghĩa các rule validate cho từng field của `ContentData`.

```typescript
type ValidationRules = {
  [key: string]: any | ((value: any, context?: any) => boolean | string);
};
```

Ví dụ:

```typescript
const validationRules = {
  value: {
    required: true,
    minLength: 3,
    maxLength: 10,
    custom: (value: string, context?: any) => {
      // Custom validation logic
      if (value.includes(" ")) {
        return "Value cannot contain spaces"; // Trả về thông báo lỗi nếu không hợp lệ
      }
      return true; // Trả về true nếu hợp lệ
    },
  },
};
```

### `DefaultContentValidation`

`DefaultContentValidation` cung cấp logic validate mặc định cho các rule cơ bản như `required`, `minLength`, `maxLength`, `pattern`. Nó cũng hỗ trợ custom validator function.

### Sử dụng hệ thống validation

`ContentFactory` sử dụng `DefaultContentValidation` để validate `ContentData` trước khi tạo `ContentElement`. Bạn có thể cấu hình validation thông qua `FactoryOptions`:

```typescript
const factoryOptions = {
  validate: true, // Bật validation
  validationRules: {
    [ContentType.TEXT]: {
      value: {
        required: true,
        minLength: 1,
      },
    },
  },
};

const contentFactory = new ContentFactory(
  new ContentFactoryRegistry(),
  new DefaultContentValidation(),
  new DefaultContentConfiguration(),
  factoryOptions,
);
```

## Plugin System

Hệ thống plugin cho phép mở rộng chức năng của `ContentFactory` và `ContentElement` mà không cần sửa đổi code lõi.

### `IContentPlugin`

Interface `IContentPlugin` định nghĩa các phương thức cho plugin:

```typescript
interface IContentPlugin {
  init?(factory: IContentElementFactory): void;
  apply?(data: ContentData): void;
  dispose?(): void;
}
```

- **`init`:** Được gọi khi plugin được đăng ký với `ContentFactory`.
- **`apply`:** Được gọi trước khi `ContentElement` được tạo.
- **`dispose`:** Được gọi khi plugin bị hủy đăng ký.

### `PluginRegistry`

`PluginRegistry` quản lý việc đăng ký và áp dụng plugin. `ContentFactory` sử dụng `PluginRegistry` để quản lý các plugin.

### Các loại plugin

- **`IValidationPlugin`:** Plugin để mở rộng hệ thống validation.
- **`IRenderingPlugin`:** Plugin để can thiệp vào quá trình rendering.
- **`IBehaviorPlugin`:** Plugin để thêm các hành vi mới cho `ContentElement`.
- **`IUtilityPlugin`:** Plugin cung cấp các hàm tiện ích.

### Sử dụng plugin mẫu

#### `MaxLengthValidationPlugin`

Plugin này bổ sung rule `maxLength` để giới hạn độ dài tối đa của text.

**Cách sử dụng:**

```typescript
import { MaxLengthValidationPlugin } from "plugins/MaxLengthValidationPlugin";

const factoryOptions = {
  plugins: [new MaxLengthValidationPlugin(10)], // Giới hạn độ dài tối đa là 10
};

const contentFactory = new ContentFactory(
    new ContentFactoryRegistry(),
    new DefaultContentValidation(),
    new DefaultContentConfiguration(),
    factoryOptions
);
```

#### `LogRenderPlugin`

Plugin này log thông tin về element và canvas ra console mỗi khi render.

**Cách sử dụng:**

```typescript
import { LogRenderPlugin } from "plugins/LogRenderPlugin";

const contentFactory = new ContentFactory(
    new ContentFactoryRegistry(),
    new DefaultContentValidation(),
    new DefaultContentConfiguration()
);

contentFactory.registerPlugin(new LogRenderPlugin());
```

#### `DraggableBehaviorPlugin`

Plugin này cho phép người dùng kéo thả element trên canvas.

**Cách sử dụng:**
```typescript
import { DraggableBehaviorPlugin } from "plugins/DraggableBehaviorPlugin";

const factoryOptions = {
  plugins: [new DraggableBehaviorPlugin()],
};

// Khi tạo ContentFactory
const contentFactory = new ContentFactory(
  new ContentFactoryRegistry(),
  new DefaultContentValidation(),
  new DefaultContentConfiguration(),
  factoryOptions
);

// Trong component sử dụng ContentElement (ví dụ: PDFViewer.tsx)
// ...
const canvas = containerRef.current?.querySelector("canvas");
// ...
useEffect(() => {
    if (canvas && contentManagerRef.current) {
      const divs = contentManagerRef.current.querySelectorAll(
        "[data-add-content]",
      );
      divs.forEach((div) => {
        const addContentFunc = div.getAttribute("data-add-content");
        if (addContentFunc) {
          const element = // @ts-ignore
            contentManagerRef.current[addContentFunc];
          // @ts-ignore
          const plugin = new DraggableBehaviorPlugin();
          plugin.enableDragging(element, canvas);
        }
      });
    }
  }, [canvasSize, contentData]);
```

**Lưu ý:** `DraggableBehaviorPlugin` đang trong quá trình phát triển, bạn nên làm lại logic để sử dụng tốt hơn.

#### `DebugHelperPlugin`

Plugin này cung cấp các hàm helper để debug.

**Cách sử dụng:**

```typescript
import { DebugHelperPlugin } from "plugins/DebugHelperPlugin";

const contentFactory = new ContentFactory(
    new ContentFactoryRegistry(),
    new DefaultContentValidation(),
    new DefaultContentConfiguration()
);
const debugPlugin = new DebugHelperPlugin();
contentFactory.registerPlugin(debugPlugin);

// Trong component sử dụng ContentElement (ví dụ: PDFViewer.tsx)
// ...
const canvas = containerRef.current?.querySelector("canvas");
const ctx = canvas?.getContext("2d");

if (ctx) {
    debugPlugin.drawBoundingBox(element, ctx); // element là một instance của ContentElement
}
// ...
```

### Viết plugin mới

Để viết plugin mới, bạn cần tạo một class implement `IContentPlugin` hoặc các interface plugin cụ thể hơn (`IValidationPlugin`, `IRenderingPlugin`, `IBehaviorPlugin`, `IUtilityPlugin`).

**Ví dụ tạo `IUtilityPlugin`:**

```typescript
import { IUtilityPlugin, ContentElement, UtilityPluginType } from "./types";

class MyUtilityPlugin implements IUtilityPlugin {
  name = "MyUtilityPlugin";
  type: UtilityPluginType = "utility";

  init(factory: IContentElementFactory): void {
    // Khởi tạo plugin
  }

  apply(data: ContentData): void {
    // Thực thi code mỗi khi element chuẩn bị được tạo
  }

  myCustomMethod(element: ContentElement) {
    // Logic của bạn
  }
}
```

**Sau đó, bạn có thể đăng ký plugin với `ContentFactory`:**

```typescript
const contentFactory = new ContentFactory(
    new ContentFactoryRegistry(),
    new DefaultContentValidation(),
    new DefaultContentConfiguration()
);

contentFactory.registerPlugin(new MyUtilityPlugin());
```

## Ví dụ

Phần này sẽ cung cấp các ví dụ minh họa cho các tính năng chính của hệ thống.

**(Bổ sung các ví dụ cụ thể)**

## Mở rộng

Hệ thống được thiết kế để dễ dàng mở rộng. Bạn có thể:

- Tạo các `ContentElement` mới bằng cách implement `ContentElement` interface.
- Đăng ký factory mới cho các `ContentElement` mới.
- Tạo các strategy mới bằng cách implement các strategy interface.
- Viết các custom validator.
- Phát triển các plugin mới để thêm tính năng.

## FAQ

**(Bổ sung các câu hỏi thường gặp và câu trả lời)**

## Kết luận

Hệ thống Strategy và Factory cung cấp một giải pháp mạnh mẽ và linh hoạt để quản lý và hiển thị các nội dung trong ứng dụng của bạn. Với kiến trúc rõ ràng, khả năng mở rộng cao và các plugin tiện ích, nó giúp bạn xây dựng các ứng dụng phức tạp một cách dễ dàng và hiệu quả.
