import { useState } from "react";
import Editor from "react-simple-code-editor";
// @ts-ignore: no type declarations for prismjs in this project
import Prism from "prismjs";
import "prismjs/components/prism-python";   // load python syntax
import "prismjs/themes/prism.css";          // or prism-okaidia.css for dark

export default function PythonEditor() {
  const [code, setCode] = useState(`"""Arithmetic operators and math module."""\nimport math\na, b = 10, 3\nprint("add:", a+b)`);

  return (
    <Editor
      value={code}
      onValueChange={setCode}
      highlight={code => Prism.highlight(code, Prism.languages.python, "python")}
      padding={12}
      textareaId="codeArea"
      className="editor prism-code"
      style={{
        fontFamily: "ui-monospace, Menlo, Monaco, 'Courier New', monospace",
        fontSize: 14,
        borderRadius: 12,
        minHeight: 280,
      }}
    />
  );
}