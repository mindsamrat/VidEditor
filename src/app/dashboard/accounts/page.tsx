import { TopBar } from "@/components/dashboard/TopBar";

const ACCOUNTS = [
  { platform: "TikTok", handle: "@mythbites", connected: true, scopes: "video.upload, video.list" },
  { platform: "TikTok", handle: "@coldcaseclips", connected: true, scopes: "video.upload" },
  { platform: "Instagram", handle: "@mythbites", connected: true, scopes: "instagram_content_publish" },
  { platform: "Instagram", handle: "@spacefactsdaily", connected: false },
  { platform: "YouTube", handle: "@mythbites", connected: true, scopes: "youtube.upload" },
  { platform: "YouTube", handle: "@spacefactsdaily", connected: true, scopes: "youtube.upload" },
];

export default function AccountsPage() {
  return (
    <>
      <TopBar title="Connected accounts" subtitle="ReelForge posts via each platform's official API." />
      <main className="p-6 space-y-6">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { name: "TikTok", api: "Content Posting API", count: 2 },
            { name: "Instagram", api: "Graph API · Content Publishing", count: 1 },
            { name: "YouTube", api: "Data API v3", count: 2 },
          ].map((p) => (
            <div key={p.name} className="card p-5">
              <p className="text-xs text-ink-mute uppercase tracking-wider">{p.name}</p>
              <p className="font-display text-lg font-semibold mt-1">{p.count} accounts</p>
              <p className="text-xs text-ink-mute mt-1">{p.api}</p>
              <button className="btn-ghost text-xs py-2 px-3 mt-4">+ Connect another</button>
            </div>
          ))}
        </div>

        <section className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-mute text-xs uppercase tracking-wider border-b border-line">
              <tr>
                <th className="px-5 py-3">Platform</th>
                <th className="px-5 py-3">Handle</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Scopes</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((a, i) => (
                <tr key={i} className="border-b border-line/60 last:border-0">
                  <td className="px-5 py-3">{a.platform}</td>
                  <td className="px-5 py-3 text-ink-dim">{a.handle}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.connected ? "bg-brand/10 text-brand" : "bg-red-500/10 text-red-400"
                    }`}>
                      {a.connected ? "connected" : "needs reconnect"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-ink-mute">{a.scopes || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs text-ink-dim hover:text-ink">
                      {a.connected ? "Disconnect" : "Reconnect"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
