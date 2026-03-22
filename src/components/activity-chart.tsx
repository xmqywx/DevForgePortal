interface ChartProps {
  openedData: { day: string; count: number }[];
  resolvedData: { day: string; count: number }[];
}

export function ActivityChart({ openedData, resolvedData }: ChartProps) {
  const width = 600;
  const height = 200;
  const padding = 40;

  // Generate last 30 days
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  // Map data into arrays of 30 values
  const openedMap = new Map(openedData.map((d) => [d.day, d.count]));
  const resolvedMap = new Map(resolvedData.map((d) => [d.day, d.count]));

  const openedValues = days.map((d) => openedMap.get(d) ?? 0);
  const resolvedValues = days.map((d) => resolvedMap.get(d) ?? 0);

  const allValues = [...openedValues, ...resolvedValues];
  const maxVal = Math.max(...allValues, 1);

  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  function toPoints(values: number[]): string {
    return values
      .map((v, i) => {
        const x = padding + (i / 29) * chartW;
        const y = padding + chartH - (v / maxVal) * chartH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  // Format day label: "Mar 15"
  function formatLabel(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }

  // Y-axis tick values
  const yTicks: number[] = [];
  const step = maxVal <= 4 ? 1 : Math.ceil(maxVal / 4);
  for (let v = 0; v <= maxVal; v += step) {
    yTicks.push(v);
  }
  if (yTicks[yTicks.length - 1] < maxVal) {
    yTicks.push(maxVal);
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {yTicks.map((v) => {
        const y = padding + chartH - (v / maxVal) * chartH;
        return (
          <g key={`y-${v}`}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e5e0"
              strokeWidth="1"
            />
            <text
              x={padding - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-gray-400"
              fontSize="10"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* X-axis labels (every 5th day) */}
      {days.map((day, i) => {
        if (i % 5 !== 0) return null;
        const x = padding + (i / 29) * chartW;
        return (
          <text
            key={day}
            x={x}
            y={height - 8}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize="10"
          >
            {formatLabel(day)}
          </text>
        );
      })}

      {/* Opened line (green) */}
      <polyline
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={toPoints(openedValues)}
      />

      {/* Resolved line (blue) */}
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={toPoints(resolvedValues)}
      />

      {/* Legend */}
      <circle cx={padding} cy={14} r={4} fill="#22c55e" />
      <text x={padding + 8} y={18} fontSize="10" className="fill-gray-500">
        Opened
      </text>
      <circle cx={padding + 65} cy={14} r={4} fill="#3b82f6" />
      <text
        x={padding + 73}
        y={18}
        fontSize="10"
        className="fill-gray-500"
      >
        Resolved
      </text>
    </svg>
  );
}
