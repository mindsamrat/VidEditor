import { FEATURES } from "@/lib/data";

export function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">Features</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Everything a faceless content team does. Without the team.
        </h2>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-6 hover:border-ink/20 transition group">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-ink-dim">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
