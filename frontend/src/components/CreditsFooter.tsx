import { IMAGE_ATTRIBUTIONS } from "../data/assets";

export function CreditsFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-6 py-8">
      <div className="border-t border-outline pt-6">
        <p className="hud-label mb-2">Image Credits</p>
        {IMAGE_ATTRIBUTIONS.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Driver and team imagery not yet added. See{" "}
            <code className="telemetry">frontend/ASSETS.md</code> for how to
            source CC-licensed images.
          </p>
        ) : (
          <ul className="space-y-1 text-xs text-on-surface-variant">
            {IMAGE_ATTRIBUTIONS.map((a, i) => (
              <li key={i}>
                {a.subject} — {a.author},{" "}
                <a
                  href={a.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-on-surface"
                >
                  {a.license}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-on-surface-variant">
          Pace estimates are subjective and not affiliated with Formula 1 or any
          team. Built as a personal project.
        </p>
      </div>
    </footer>
  );
}
