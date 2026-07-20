import { getMascotStyle } from "@/lib/mascot";

export function Mascot({ levelName, size = 64 }: { levelName: string; size?: number }) {
  const style = getMascotStyle(levelName);
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full border-2"
      style={{
        width: size,
        height: size,
        borderColor: style.ringColor,
        boxShadow: style.glow,
      }}
    >
      {style.crown && <span className="absolute -top-3 text-lg">👑</span>}
      <span style={{ fontSize: size * 0.5, filter: style.filter, lineHeight: 1 }}>{style.emoji}</span>
    </div>
  );
}
