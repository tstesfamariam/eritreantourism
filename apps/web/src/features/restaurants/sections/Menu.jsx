import { fmt } from "../styleHelpers";

export default function Menu({ restaurant: r, theme: t }) {
  const heading = (
    <div style={{ textAlign: "center", marginBottom: 40 }}>
      <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700 }}>The menu</div>
      <h2 style={{ fontFamily: `'${t.display}', serif`, fontSize: "clamp(30px, 5vw, 44px)", margin: "8px 0 0", color: t.ink }}>What we cook</h2>
    </div>
  );

  if (t.menu === "cards")
    return (
      <section id="menu" style={{ padding: "72px 24px", maxWidth: 1020, margin: "0 auto" }}>
        {heading}
        {r.menu.map((sec) => (
          <div key={sec.section} style={{ marginBottom: 36 }}>
            <h3 style={{ fontFamily: `'${t.display}', serif`, fontSize: 22, color: t.accent2, margin: "0 0 16px" }}>{sec.section}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {sec.items.map((it) => (
                <div key={it.name} style={{ background: t.surface, borderRadius: t.radius, padding: 20, border: `1px solid ${t.ink}14` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <strong style={{ color: t.ink, fontSize: 16 }}>{it.name}</strong>
                    <span style={{ color: t.accent, fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(it.price)}</span>
                  </div>
                  <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.55, margin: "8px 0 0" }}>{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    );

  if (t.menu === "editorial")
    return (
      <section id="menu" style={{ padding: "72px 24px", maxWidth: 980, margin: "0 auto" }}>
        {heading}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
          {r.menu.map((sec) => (
            <div key={sec.section}>
              <h3 style={{ fontFamily: `'${t.display}', serif`, fontSize: 21, color: t.ink, borderBottom: `2px solid ${t.accent}`, paddingBottom: 8, margin: "0 0 18px" }}>{sec.section}</h3>
              {sec.items.map((it) => (
                <div key={it.name} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <strong style={{ color: t.ink, fontSize: 15 }}>{it.name}</strong>
                    <span style={{ color: t.accent, fontWeight: 700 }}>{fmt(it.price)}</span>
                  </div>
                  <p style={{ color: t.muted, fontSize: 13.5, lineHeight: 1.5, margin: "4px 0 0" }}>{it.desc}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );

  if (t.menu === "minimal")
    return (
      <section id="menu" style={{ padding: "72px 24px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        {heading}
        {r.menu.map((sec) => (
          <div key={sec.section} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent2, fontWeight: 700, marginBottom: 18 }}>{sec.section}</div>
            {sec.items.map((it) => (
              <div key={it.name} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: `'${t.display}', serif`, fontSize: 20, color: t.ink }}>{it.name} <span style={{ color: t.accent, fontSize: 16 }}>— {fmt(it.price)}</span></div>
                <p style={{ color: t.muted, fontSize: 14, margin: "4px 0 0", lineHeight: 1.5 }}>{it.desc}</p>
              </div>
            ))}
          </div>
        ))}
      </section>
    );

  // leader (classic dotted list)
  return (
    <section id="menu" style={{ padding: "72px 24px", maxWidth: 720, margin: "0 auto" }}>
      {heading}
      {r.menu.map((sec) => (
        <div key={sec.section} style={{ marginBottom: 36 }}>
          <h3 style={{ fontFamily: `'${t.display}', serif`, fontSize: 22, color: t.accent2, margin: "0 0 16px", textAlign: "center" }}>{sec.section}</h3>
          {sec.items.map((it) => (
            <div key={it.name} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <strong style={{ color: t.ink, fontSize: 16, whiteSpace: "nowrap" }}>{it.name}</strong>
                <span style={{ flex: 1, borderBottom: `1px dotted ${t.muted}88`, transform: "translateY(-4px)" }} />
                <span style={{ color: t.accent, fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(it.price)}</span>
              </div>
              <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.5, margin: "4px 0 0" }}>{it.desc}</p>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
