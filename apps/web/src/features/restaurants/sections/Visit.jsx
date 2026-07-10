export default function Visit({ restaurant: r, theme: t }) {
  return (
    <section id="visit" style={{ padding: "72px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 36 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700, marginBottom: 12 }}>Hours</div>
          {r.hours.map(([d, h]) => (
            <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${t.ink}14`, fontSize: 15 }}>
              <span style={{ color: t.ink, fontWeight: 600 }}>{d}</span>
              <span style={{ color: t.muted }}>{h}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700, marginBottom: 12 }}>Find us</div>
          <p style={{ color: t.ink, fontSize: 16, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{r.address}</p>
          <p style={{ color: t.muted, fontSize: 15, margin: "10px 0 0" }}>{r.phone}</p>
          <div style={{ marginTop: 18, height: 130, borderRadius: t.radius, background: `${t.accent}18`, border: `1px dashed ${t.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", color: t.muted, fontSize: 13 }}>
            Map embed (Google Maps / OSM) in production
          </div>
        </div>
      </div>
    </section>
  );
}
