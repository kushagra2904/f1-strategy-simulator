import "./StrategyTimeline.css";

export default function StrategyTimeline({ strategy }) {
  if (!strategy || strategy.length === 0) {
    return null;
  }

  return (
    <div className="timeline-container">
      <h3 className="timeline-title">🕒 Strategy Timeline</h3>

      <div className="timeline-bar">
        {strategy.map((stint, index) => (
          <div
            key={index}
            className={`timeline-stint ${stint.compound.toLowerCase()}`}
            style={{ flex: stint.length }}
          >
            <span className="stint-label">
              {stint.compound} ({stint.length})
            </span>
          </div>
        ))}
      </div>

      <div className="timeline-legend">
        <span className="soft">SOFT</span>
        <span className="medium">MEDIUM</span>
        <span className="hard">HARD</span>
      </div>
    </div>
  );
}