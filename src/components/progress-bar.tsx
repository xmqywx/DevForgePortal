export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#c6e135] rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
