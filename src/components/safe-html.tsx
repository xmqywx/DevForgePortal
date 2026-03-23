function isHtml(str: string) {
  return /<[a-z][\s\S]*>/i.test(str);
}

// Fix relative upload paths to absolute URLs
function fixImagePaths(html: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  // Replace src="/uploads/..." with full URL
  return html.replace(/src="\/uploads\//g, `src="${baseUrl}/uploads/`);
}

export function SafeHtml({ content, className }: { content: string; className?: string }) {
  if (isHtml(content)) {
    const fixed = fixImagePaths(content);
    return <div className={`rendered-html ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: fixed }} />;
  }
  return <div className={`${className ?? ""} whitespace-pre-wrap`}>{content}</div>;
}
