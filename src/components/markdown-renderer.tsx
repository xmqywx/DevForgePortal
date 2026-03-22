"use client";

import React from "react";

/**
 * Renders basic markdown: # headers, **bold**, `code`, ```code blocks```, - lists, [links](url)
 * NO external library needed, just string parsing + JSX
 */
export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div className="markdown-content space-y-3 text-sm text-gray-700 leading-relaxed">
      {blocks.map((block, i) => (
        <React.Fragment key={i}>{renderBlock(block)}</React.Fragment>
      ))}
    </div>
  );
}

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "paragraph"; text: string };

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", lang, text: codeLines.join("\n") });
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4) });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2) });
      i++;
      continue;
    }

    // List items
    if (line.trimStart().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("- ")) {
        items.push(lines[i].trimStart().slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].trimStart().startsWith("- ") &&
      !lines[i].trimStart().startsWith("```")
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join("\n") });
    }
  }

  return blocks;
}

function renderBlock(block: Block): React.ReactNode {
  switch (block.type) {
    case "h1":
      return (
        <h1 className="text-2xl font-bold text-[#1a1a1a] mt-4 mb-2">
          {renderInline(block.text)}
        </h1>
      );
    case "h2":
      return (
        <h2 className="text-lg font-bold text-[#1a1a1a] mt-3 mb-1.5 border-b border-gray-100 pb-1.5">
          {renderInline(block.text)}
        </h2>
      );
    case "h3":
      return (
        <h3 className="text-base font-semibold text-[#1a1a1a] mt-2 mb-1">
          {renderInline(block.text)}
        </h3>
      );
    case "code":
      return (
        <pre className="bg-[#1a1a1a] text-gray-200 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed">
          <code>{block.text}</code>
        </pre>
      );
    case "ul":
      return (
        <ul className="list-disc list-inside space-y-1 pl-1">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "paragraph":
      return <p>{renderInline(block.text)}</p>;
  }
}

function renderInline(text: string): React.ReactNode {
  // Process inline elements: **bold**, `code`, [text](url)
  const parts: React.ReactNode[] = [];
  // Regex to match **bold**, `code`, or [text](url)
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold text-[#1a1a1a]">
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      // `code`
      parts.push(
        <code
          key={match.index}
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {match[3]}
        </code>
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      // [text](url)
      parts.push(
        <a
          key={match.index}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
