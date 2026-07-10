export default function Footer({ restaurant: r, theme: t }) {
  return (
    <footer style={{ borderTop: `1px solid ${t.ink}18`, padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: `'${t.display}', serif`, fontSize: 20, color: t.ink, fontWeight: 700 }}>{r.name}</div>
      <p style={{ color: t.muted, fontSize: 13, margin: "8px 0 0" }}>
        {r.cuisine} · {r.city}, Eritrea · Part of <span style={{ color: t.accent, fontWeight: 700 }}>eritreantourism.com</span>
      </p>
    </footer>
  );
}
