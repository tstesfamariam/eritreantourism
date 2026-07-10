import { galleryTone } from "../styleHelpers";

export default function Hero({ restaurant: r, theme: t }) {
  const eyebrow = (
    <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700, marginBottom: 16 }}>
      {r.cuisine} · {r.city} · Since {r.est}
    </div>
  );
  const cta = (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
      <a href="#reserve" style={{ background: t.accent, color: t.dark ? t.bg : "#fff", padding: "13px 26px", borderRadius: t.radius, fontWeight: 700, fontSize: 14, textDecoration: "none", letterSpacing: "0.04em" }}>Reserve a table</a>
      <a href="#menu" style={{ border: `2px solid ${t.ink}55`, color: t.ink, padding: "11px 24px", borderRadius: t.radius, fontWeight: 700, fontSize: 14, textDecoration: "none", letterSpacing: "0.04em" }}>See the menu</a>
    </div>
  );
  const title = (size) => (
    <h1 style={{ fontFamily: `'${t.display}', serif`, fontSize: `clamp(38px, 7vw, ${size}px)`, lineHeight: 1.05, margin: 0, color: t.ink, fontWeight: 700 }}>{r.tagline}</h1>
  );

  if (t.hero === "split")
    return (
      <header style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 0, alignItems: "stretch" }}>
        <div style={{ padding: "72px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {eyebrow}{title(58)}
          <p style={{ color: t.muted, fontSize: 17, lineHeight: 1.6, marginTop: 18, maxWidth: 480 }}>{r.story[0].split(".")[0]}.</p>
          {cta}
        </div>
        <div style={{ minHeight: 340, background: galleryTone(t, "c"), display: "flex", alignItems: "flex-end", padding: 24 }}>
          <span style={{ color: "#fff", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.9 }}>{r.gallery[0].label}</span>
        </div>
      </header>
    );

  if (t.hero === "banner")
    return (
      <header style={{ padding: "80px 24px 64px", textAlign: "left", maxWidth: 880, margin: "0 auto" }}>
        {eyebrow}{title(64)}
        <p style={{ color: t.muted, fontSize: 18, lineHeight: 1.65, marginTop: 20, maxWidth: 620 }}>{r.story[0].split(".")[0]}.</p>
        {cta}
      </header>
    );

  if (t.hero === "stacked")
    return (
      <header style={{ padding: "88px 24px 64px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
        {eyebrow}{title(66)}
        <p style={{ color: t.muted, fontSize: 17, lineHeight: 1.65, marginTop: 20 }}>{r.story[0].split(".")[0]}.</p>
        <div style={{ display: "flex", justifyContent: "center" }}>{cta}</div>
      </header>
    );

  if (t.hero === "frame")
    return (
      <header style={{ padding: "40px 24px" }}>
        <div style={{ border: `2px solid ${t.ink}`, padding: "64px 32px", maxWidth: 900, margin: "0 auto", textAlign: "center", borderRadius: t.radius, background: t.surface }}>
          {eyebrow}{title(60)}
          <p style={{ color: t.muted, fontSize: 17, lineHeight: 1.65, marginTop: 18, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>{r.story[0].split(".")[0]}.</p>
          <div style={{ display: "flex", justifyContent: "center" }}>{cta}</div>
        </div>
      </header>
    );

  // full
  return (
    <header style={{ minHeight: 480, display: "flex", alignItems: "center", background: `linear-gradient(160deg, ${t.bg} 30%, ${t.accent}22 100%)`, padding: "72px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", width: "100%" }}>
        {eyebrow}{title(72)}
        <p style={{ color: t.muted, fontSize: 18, lineHeight: 1.65, marginTop: 20, maxWidth: 560 }}>{r.story[0].split(".")[0]}.</p>
        {cta}
      </div>
    </header>
  );
}
