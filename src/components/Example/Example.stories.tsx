import type { Meta, StoryObj } from "@storybook/react";
import { Example } from ".";

const meta: Meta<typeof Example> = {
  title: "Components/Example",
  component: Example,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Example>;

export const Default: Story = {
  args: {
    text: "Example Component",
  },
};

export const WithClick: Story = {
  args: {
    text: "Click me",
    onClick: () => alert("Clicked!"),
  },
};
