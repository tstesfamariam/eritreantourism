export default function Signatures({ restaurant: r, theme: t }) {
  return (
    <div style={{ borderTop: `1px solid ${t.ink}18`, borderBottom: `1px solid ${t.ink}18`, padding: "18px 24px", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {r.signatures.map((s) => (
        <span key={s} style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: t.accent2, padding: "6px 14px", border: `1px solid ${t.accent2}55`, borderRadius: t.radius }}>{s}</span>
      ))}
    </div>
  );
}
