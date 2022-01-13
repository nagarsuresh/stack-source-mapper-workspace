export interface StackTraceFrame {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  sourceSnippet?: SourceSnippet[];
  funcName?: string;
  funcArgs?: string[];
}

export interface SourceSnippet {
  line?: number;
  text: string;
}