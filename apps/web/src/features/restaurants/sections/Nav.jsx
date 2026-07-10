export default function Nav({ restaurant: r, theme: t }) {
  const link = { color: t.ink, textDecoration: "none", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, opacity: 0.85 };
  const btn = { background: t.accent, color: t.dark ? t.bg : "#fff", padding: "9px 18px", borderRadius: t.radius, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", border: "none", cursor: "pointer" };
  const brand = <span style={{ fontFamily: `'${t.display}', serif`, fontSize: 22, fontWeight: 700, color: t.ink }}>{r.name}</span>;
  const links = (
    <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <a href="#menu" style={link}>Menu</a>
      <a href="#story" style={link}>Our story</a>
      <a href="#visit" style={link}>Visit</a>
    </div>
  );
  if (t.nav === "center")
    return (
      <nav style={{ padding: "20px 24px", textAlign: "center", borderBottom: `1px solid ${t.ink}18` }}>
        <div style={{ marginBottom: 12 }}>{brand}</div>
        <div style={{ display: "flex", gap: 22, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          {links} <a href="#reserve" style={{ ...btn, textDecoration: "none" }}>Reserve a table</a>
        </div>
      </nav>
    );
  return (
    <nav style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderBottom: t.nav === "split" ? `1px solid ${t.ink}18` : "none" }}>
      {brand}
      <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        {links}
        <a href="#reserve" style={{ ...btn, textDecoration: "none" }}>Reserve</a>
      </div>
    </nav>
  );
}
