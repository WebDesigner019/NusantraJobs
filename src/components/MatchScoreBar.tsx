import { Progress } from "@/components/ui/progress";

interface MatchScoreBarProps {
  score: number;
  size?: "sm" | "md";
}

export function MatchScoreBar({ score, size = "md" }: MatchScoreBarProps) {
  // Color tier
  let color = "bg-slate-400";
  let textColor = "text-slate-600";
  let label = "Rendah";
  if (score >= 75) {
    color = "bg-emerald-500";
    textColor = "text-emerald-700";
    label = "Sangat cocok";
  } else if (score >= 40) {
    color = "bg-[#FDAA3E]";
    textColor = "text-amber-700";
    label = "Cukup cocok";
  }

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={`text-xs font-semibold ${textColor}`}>Skor Kecocokan</span>
        <span className="text-sm font-bold text-slate-900">{score}%</span>
      </div>
      <div className={`relative w-full ${size === "sm" ? "h-1.5" : "h-2"} bg-slate-200 rounded-full overflow-hidden`}>
        <div
          className={`absolute left-0 top-0 h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      {size === "md" && (
        <p className="text-[11px] text-slate-500 mt-1">{label} — berdasarkan kecocokan skill</p>
      )}
    </div>
  );
}
