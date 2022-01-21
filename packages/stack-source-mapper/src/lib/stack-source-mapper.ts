import { readdirSync, readFileSync } from 'fs';
import { NullableMappedPosition, SourceMapConsumer } from 'source-map';
import { parse, StackFrame } from 'stacktrace-parser';

import { MapStackOptions } from './dto/options';
import { SourceSnippet, StackTraceFrame } from './dto/stack-frame';
import { EOL } from 'os';

export async function mapStackTrace(
  stackTrace: string,
  sourceMapLocation: string,
  options: MapStackOptions): Promise<string>;

export async function mapStackTrace(
  stackTrace: StackTraceFrame[],
  sourceMapLocation: string,
  options: MapStackOptions): Promise<StackTraceFrame[]>;


export async function mapStackTrace(
  stackTrace: string | StackTraceFrame[],
  sourceMapLocation: string,
  options: MapStackOptions): Promise<StackTraceFrame[] | string> {

  const inputStack: StackTraceFrame[] = (Array.isArray(stackTrace)) ? stackTrace : parseStackTrace(stackTrace);

  const outputStack: StackTraceFrame[] = await mapStackFrames(inputStack, sourceMapLocation, options);

  return Array.isArray(stackTrace) ? outputStack : serializeFrames(outputStack);

}

export function parseStackTrace(stackTrace: string): StackTraceFrame[] {
  const frames: StackFrame[] = parse(stackTrace);

  return frames.map(frame => ({
    fileName: frame.file as string,
    columnNumber: frame.column as number,
    lineNumber: frame.lineNumber as number,
    funcName: frame.methodName,
    funcArgs: frame.arguments
  }));
}

export function serializeFrames(stackFrames: StackTraceFrame[]): string {
  return stackFrames.map(frame => serializeStackTraceFrame(frame)).join(EOL);
}


async function mapStackFrames(stackFrames: StackTraceFrame[], location: string, options: MapStackOptions): Promise<StackTraceFrame[]> {
  const mappedFrames: StackTraceFrame[] = [];
  const sourceMapFiles: string[] = getSourceMapFiles(location);

  // let i = 0;
  for (const exceptionFrame of stackFrames) {
    // if (i > 12) {
    //   break;
    // }
    const sourceFile: string = getMatchingSourcMapFile(exceptionFrame, sourceMapFiles, options);
    if (sourceFile) {
      try {
        const mappedFrame = await getMappedStackFrame(exceptionFrame, location, sourceFile, options);
        mappedFrames.push(mappedFrame);
      } catch (err) {
        console.error(`Error mapping stack frame ${serializeStackTraceFrame(exceptionFrame)}.`, err);
      }
    }
    // i++;
  }

  return mappedFrames;
}


function getSourceMapFiles(location: string): string[] {
  const mapFiles = readdirSync(location).filter((file: string) => file.endsWith('.map'));
  return mapFiles;
}


function getMatchingSourcMapFile(frame: StackTraceFrame, sourceMapFiles: string[], options: MapStackOptions): string {
  let matchingFileName: string = null;
  const exceptionFileName: string = frame.fileName?.substring(frame.fileName.lastIndexOf('/') + 1);
  if (options.strict) {
    matchingFileName = sourceMapFiles.find(file => `${exceptionFileName}.map` === file);
  } else {
    let highestCount = 0;
    sourceMapFiles.forEach(sourceMapFile => {
      const matchCount = getMatchCount(exceptionFileName, sourceMapFile);
      if (matchCount !== 0 && matchCount >= highestCount) {
        highestCount = matchCount;
        matchingFileName = sourceMapFile;
      }
    });
  }

  if (!matchingFileName) {
    console.warn(`No Matching source map file found for ${exceptionFileName}`);
  }
  return matchingFileName;
}

function getMatchCount(stackFile: string, sourceMapFile: string): number {
  if (!stackFile) {
    return 0;
  }
  let index = 0;
  while (stackFile[index] === sourceMapFile[index]) index++;
  return index;
}


function getMappedStackFrame(
  exceptionFrame: StackTraceFrame,
  location: string, sourceMapFile: string, options: MapStackOptions): Promise<StackTraceFrame> {

  return new Promise((resolve, reject) => {
    try {
      const mappedFrame: StackTraceFrame = {};
      const rawSourceMap = String(readFileSync(`${location}${sourceMapFile}`));
      SourceMapConsumer.with(rawSourceMap, null, consumer => {
        const sourceInfo: NullableMappedPosition = consumer.originalPositionFor({
          line: <number>exceptionFrame.lineNumber,
          column: exceptionFrame.columnNumber
        });
        mappedFrame.fileName = sourceInfo.source;
        mappedFrame.funcName = sourceInfo.name;
        mappedFrame.columnNumber = sourceInfo.column;
        mappedFrame.lineNumber = sourceInfo.line;

        try {
          if (options.sourceSnippet) {
            const sourceContents = consumer.sourceContentFor(<string>sourceInfo.source);
            const sourceSnippet = getSourceLines(sourceContents, sourceInfo, options.sourceLines || 3);
            if (sourceSnippet) {
              mappedFrame.sourceSnippet = sourceSnippet;
            }
          }
        } catch (err) {
          resolve(mappedFrame);
        }

        resolve(mappedFrame);
      });

    } catch (err) {
      reject('Not parseable');
    }
  });

}

function getSourceLines(sourceContents: string | null, sourceInfo: NullableMappedPosition, numOfLines: number): SourceSnippet[] {
  if (sourceContents) {
    const lines = sourceContents.trim().split('\n');
    if (sourceInfo.line) {
      const start = sourceInfo.line - numOfLines;
      const end = sourceInfo.line + numOfLines;
      return lines.slice(start, end).map((line, index) => ({ line: start + index + 1, text: line }))
    }
  }
  return null;
}

function serializeStackTraceFrame(frame: StackTraceFrame): string {
  let sourceSnippet = null;
  if (frame.sourceSnippet && frame.sourceSnippet.length !== 0) {
    sourceSnippet = `--------------------source code -----------------${EOL}`;
    sourceSnippet += frame.sourceSnippet.map(line => {
      return `${line.line}:  ${line.text}`
    }).join(EOL);
  }
  return `${frame.funcName} -> (  ${frame.fileName} [${frame.lineNumber}:${frame.columnNumber}]  )${EOL}${sourceSnippet}
  `
}
