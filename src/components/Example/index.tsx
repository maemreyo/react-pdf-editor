import React from "react";

export interface ExampleProps {
  text: string;
  onClick?: () => void;
}

export const Example: React.FC<ExampleProps> = ({ text, onClick }) => {
  return <div onClick={onClick}>{text}</div>;
};
