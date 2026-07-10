export default function Story({ restaurant: r, theme: t }) {
  return (
    <section id="story" style={{ background: t.surface, padding: "72px 24px", borderTop: `1px solid ${t.ink}12`, borderBottom: `1px solid ${t.ink}12` }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 40, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700 }}>Our story</div>
          <h2 style={{ fontFamily: `'${t.display}', serif`, fontSize: "clamp(28px, 4.5vw, 40px)", margin: "10px 0 0", color: t.ink, lineHeight: 1.15 }}>Serving {r.city} since {r.est}</h2>
        </div>
        <div>
          {r.story.map((p, i) => (
            <p key={i} style={{ color: t.muted, fontSize: 16, lineHeight: 1.7, margin: i ? "16px 0 0" : 0 }}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
