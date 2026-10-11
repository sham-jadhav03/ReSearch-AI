import { isValidElement } from "react";
import CodeBlock from "../components/ui/CodeBlock";

export const renderMarkdownPre = (children) => {
  if (!isValidElement(children) || children.type === CodeBlock) return children;
  if (children.type !== "code") return children;
  return (
    <CodeBlock className={children.props.className}>
      {children.props.children}
    </CodeBlock>
  );
};
