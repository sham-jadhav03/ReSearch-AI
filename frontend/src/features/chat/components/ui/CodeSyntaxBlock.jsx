import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

const grammars = {
  bash,
  c,
  cpp,
  css,
  diff,
  go,
  java,
  javascript,
  json,
  jsx,
  markdown,
  markup,
  python,
  rust,
  sql,
  tsx,
  typescript,
  yaml,
};

Object.entries(grammars).forEach(([name, grammar]) => {
  SyntaxHighlighter.registerLanguage(name, grammar);
});

const aliases = {
  js: "javascript",
  sh: "bash",
  shell: "bash",
  ts: "typescript",
  html: "markup",
  xml: "markup",
  svg: "markup",
  yml: "yaml",
  md: "markdown",
};

const CodeSyntaxBlock = ({ language, code }) => {
  const normalizedLanguage = language?.toLowerCase();
  const resolvedLanguage = aliases[normalizedLanguage] || normalizedLanguage;

  if (
    !resolvedLanguage ||
    !Object.prototype.hasOwnProperty.call(grammars, resolvedLanguage)
  ) {
    return (
      <pre className="m-0 bg-transparent text-sm text-text-primary">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <SyntaxHighlighter
      language={resolvedLanguage}
      style={oneDark}
      PreTag="div"
      customStyle={{
        margin: 0,
        background: "transparent",
        color: "var(--color-text-primary)",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeSyntaxBlock;
