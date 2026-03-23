"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="markdown-content text-sm text-gray-700 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-[#1a1a1a] mt-4 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-[#1a1a1a] mt-4 mb-2 border-b border-gray-100 pb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-[#1a1a1a] mt-3 mb-1">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-2">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#65a30d] hover:underline">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 pl-1 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 pl-1 mb-2">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block">{children}</code>
              );
            }
            return (
              <code className="bg-gray-100 text-[#e11d48] px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#1e293b] text-gray-200 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed mb-2">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[#c6e135] pl-4 my-2 text-gray-500 italic">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border border-gray-200 rounded-lg text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-[#1a1a1a] border-b border-gray-200">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border-b border-gray-100">{children}</td>,
          hr: () => <hr className="border-t border-gray-200 my-4" />,
          img: ({ src, alt }) => (
            <img src={src} alt={alt ?? ""} className="max-w-full rounded-lg my-2" />
          ),
          strong: ({ children }) => <strong className="font-semibold text-[#1a1a1a]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
