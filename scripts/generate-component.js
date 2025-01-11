const fs = require("fs");
const path = require("path");

const componentTemplate = (name) => `import React from 'react';
import { cn } from '@/utils/cn';
import styles from './${name}.module.css';

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${name}: React.FC<${name}Props> = ({ 
  className,
  children,
  ...props 
}) => {
  return (
    <div 
      className={cn(styles.root, className)}
      {...props}
    >
      {children}
    </div>
  );
};

${name}.displayName = '${name}';
`;

const cssModuleTemplate = `
.root {
  /* Component styles */
}
`;

const storiesTemplate = (
  name
) => `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    children: '${name} Component',
  },
};

export const CustomClassName: Story = {
  args: {
    className: 'custom-class',
    children: 'Custom Styled ${name}',
  },
};
`;

const testTemplate = (name) => `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name} Component', () => {
  it('renders children correctly', () => {
    render(<${name}>Test Content</${name}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<${name} className="custom-class">Content</${name}>);
    expect(screen.getByText('Content')).toHaveClass('custom-class');
  });
});
`;

function generateComponent(name) {
  const componentDir = path.join(__dirname, "../src/components", name);
  fs.mkdirSync(componentDir, { recursive: true });

  fs.writeFileSync(
    path.join(componentDir, `${name}.tsx`),
    componentTemplate(name)
  );
  fs.writeFileSync(
    path.join(componentDir, `${name}.module.css`),
    cssModuleTemplate
  );
  fs.writeFileSync(
    path.join(componentDir, `${name}.stories.tsx`),
    storiesTemplate(name)
  );
  fs.writeFileSync(
    path.join(componentDir, `${name}.test.tsx`),
    testTemplate(name)
  );
  fs.writeFileSync(
    path.join(componentDir, "index.ts"),
    `export * from './${name}';`
  );
}

// Usage: node scripts/generate-component.js ComponentName
const componentName = process.argv[2];
if (!componentName) {
  console.error("Please provide a component name");
  process.exit(1);
}

generateComponent(componentName);
