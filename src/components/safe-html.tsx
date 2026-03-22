function isHtml(str: string) {
  return /<[a-z][\s\S]*>/i.test(str);
}

export function SafeHtml({ content, className }: { content: string; className?: string }) {
  if (isHtml(content)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <div className={`${className} whitespace-pre-wrap`}>{content}</div>;
}
