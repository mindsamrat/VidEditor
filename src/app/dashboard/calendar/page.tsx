import { TopBar } from "@/components/dashboard/TopBar";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = new Date();
const startDay = today.getDay() === 0 ? 6 : today.getDay() - 1;

const POSTS_BY_DAY: Record<number, { time: string; series: string; platform: string }[]> = {
  0: [{ time: "18:00", series: "Mythology", platform: "TT/IG/YT" }, { time: "21:00", series: "Dark Psych", platform: "TT/IG/YT" }],
  1: [{ time: "12:00", series: "Mythology", platform: "TT/IG/YT" }, { time: "18:00", series: "Space", platform: "TT/IG/YT" }],
  2: [{ time: "06:00", series: "Stoic", platform: "TT/IG/YT" }, { time: "18:00", series: "Mythology", platform: "TT/IG/YT" }],
  3: [{ time: "18:00", series: "Mythology", platform: "TT/IG/YT" }],
  4: [{ time: "12:00", series: "Mythology", platform: "TT/IG/YT" }, { time: "21:00", series: "Dark Psych", platform: "TT/IG/YT" }],
  5: [{ time: "18:00", series: "Space", platform: "TT/IG/YT" }],
  6: [{ time: "18:00", series: "Mythology", platform: "TT/IG/YT" }],
};

export default function CalendarPage() {
  return (
    <>
      <TopBar title="Calendar" subtitle="The week ahead. Drag to reschedule." />
      <main className="p-6">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line">
            {days.map((d, i) => (
              <div
                key={d}
                className={`px-4 py-3 border-r border-line/60 last:border-0 text-xs uppercase tracking-wider ${
                  i === startDay ? "text-brand" : "text-ink-mute"
                }`}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[460px]">
            {days.map((_, i) => (
              <div key={i} className="border-r border-line/60 last:border-0 p-3 space-y-2">
                {(POSTS_BY_DAY[i] || []).map((p, j) => (
                  <div
                    key={j}
                    className="text-xs p-2 rounded-md bg-brand/10 border border-brand/30 text-brand cursor-grab"
                  >
                    <div className="font-mono">{p.time}</div>
                    <div className="text-ink mt-0.5 truncate">{p.series}</div>
                    <div className="text-[10px] text-ink-mute">{p.platform}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
