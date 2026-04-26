import { TopBar } from "@/components/dashboard/TopBar";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" subtitle="Account and workspace preferences." />
      <main className="p-6 space-y-6 max-w-3xl">
        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <Field label="Name" defaultValue="Maya Reyes" />
            <Field label="Email" defaultValue="maya@mythbites.com" />
            <Field label="Time zone" defaultValue="UTC+02:00 — Athens" />
            <Field label="Default language" defaultValue="English (US)" />
          </div>
          <button className="btn-brand text-sm mt-5">Save changes</button>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold">Notifications</h2>
          <ul className="mt-4 divide-y divide-line/60 text-sm">
            {[
              "When a video has been posted",
              "When a video is awaiting your review",
              "When a connected account needs reconnecting",
              "Weekly performance digest",
              "Product updates and new features",
            ].map((n, i) => (
              <li key={n} className="py-3 flex items-center justify-between">
                <span>{n}</span>
                <span className={`w-10 h-6 rounded-full p-0.5 transition ${i === 4 ? "bg-line" : "bg-brand"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-bg transition ${i === 4 ? "" : "translate-x-4"}`} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold">Brand kit</h2>
          <p className="text-sm text-ink-dim mt-1">Logo overlay, brand colours and end-card templates applied to every render.</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button className="btn-ghost text-sm justify-start">Upload logo</button>
            <button className="btn-ghost text-sm justify-start">Pick brand colours</button>
          </div>
        </section>

        <section className="card p-6 border-red-500/30">
          <h2 className="font-display text-lg font-semibold text-red-400">Delete account</h2>
          <p className="text-sm text-ink-dim mt-1">This permanently deletes your account, all series, and queued videos. Cannot be undone.</p>
          <button className="mt-4 btn-ghost text-sm border-red-500/30 text-red-400 hover:bg-red-500/5">
            Delete account
          </button>
        </section>
      </main>
    </>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-ink-mute">{label}</span>
      <input
        defaultValue={defaultValue}
        className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
      />
    </label>
  );
}
