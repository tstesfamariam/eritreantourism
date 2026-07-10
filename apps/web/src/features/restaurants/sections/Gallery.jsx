import { galleryTone } from "../styleHelpers";

export default function Gallery({ restaurant: r, theme: t }) {
  return (
    <section style={{ padding: "64px 24px", maxWidth: 1020, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {r.gallery.map((g) => (
          <div key={g.label} style={{ height: 190, borderRadius: t.radius, background: galleryTone(t, g.tone), display: "flex", alignItems: "flex-end", padding: 16 }}>
            <span style={{ color: "#fff", fontSize: 12.5, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>{g.label}</span>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", color: t.muted, fontSize: 12.5, marginTop: 14 }}>Photo tiles are placeholders — production images load from Supabase Storage per listing.</p>
    </section>
  );
}
