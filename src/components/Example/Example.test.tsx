import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Example } from ".";

describe("Example Component", () => {
  it("renders text correctly", () => {
    // const { getByText } = render(<Example text="Hello" />);
    // expect(getByText("Hello")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    const { getByText } = render(<Example text="Click me" onClick={onClick} />);
    fireEvent.click(getByText("Click me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
