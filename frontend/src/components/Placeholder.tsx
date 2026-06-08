export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="glass panel-clip edge-accent animate-reveal grid place-items-center px-6 py-24 text-center">
      <div className="max-w-md space-y-3">
        <p className="hud-label">{title}</p>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-on-surface text-glow">
          Coming soon
        </h2>
        <p className="text-on-surface-variant">{note}</p>
      </div>
    </div>
  );
}
