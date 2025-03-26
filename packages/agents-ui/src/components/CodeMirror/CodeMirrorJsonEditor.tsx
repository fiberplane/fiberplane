import "./CodeMirrorEditorCssOverrides.css";

import { json } from "@codemirror/lang-json";
import { basicDark } from "@uiw/codemirror-theme-basic";
import { duotoneLight } from "@uiw/codemirror-theme-duotone";
import CodeMirror, { basicSetup, EditorView } from "@uiw/react-codemirror";
import { useMemo } from "react";
import { useThemeMode } from "../ThemeProvider";
import { customTheme } from "./themes";

type CodeMirrorEditorProps = {
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  theme?: string;
  readOnly?: boolean;
  value?: string;
  onChange: (value?: string) => void;
};

export function CodeMirrorJsonEditor(props: CodeMirrorEditorProps) {
  const {
    height,
    value,
    onChange,
    readOnly,
    minHeight = "200px",
    maxHeight,
  } = props;

  const mode = useThemeMode();

  const extensions = useMemo(() => {
    return [EditorView.lineWrapping, json()];
  }, []);

  return (
    <CodeMirror
      value={value}
      height={height}
      maxHeight={maxHeight}
      minHeight={minHeight}
      extensions={extensions}
      onChange={onChange}
      theme={[mode === "light" ? duotoneLight : basicDark, customTheme]}
      readOnly={readOnly}
      // Turn off basic setup here, but then use it as an extension instead (in the extension array),
      // AFTER using a keymap that allows us to conditionally intercept the "Mod+Enter" combo
      basicSetup={false}
    />
  );
}
