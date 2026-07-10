import { useState } from "react";
import { submitReservationRequest } from "../api";

export default function Reserve({ restaurant: r, theme: t }) {
  const [status, setStatus] = useState("idle"); // idle | submitting | sent | error
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", party: "2", date: "", time: "" });
  const input = { background: t.dark ? t.bg : "#fff", border: `1px solid ${t.ink}33`, borderRadius: t.radius, padding: "12px 14px", fontSize: 15, color: t.ink, width: "100%", fontFamily: `'${t.body}', sans-serif`, boxSizing: "border-box" };
  const label = { fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, color: t.muted, display: "block", marginBottom: 6 };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.date || !form.time) {
      setStatus("error");
      setErrorMessage("Fill in your name, email, date, and time to send a request.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");
    try {
      const booking = await submitReservationRequest({
        listingId: r.id,
        guestName: form.name.trim(),
        guestEmail: form.email.trim(),
        party: form.party,
        date: form.date,
        time: form.time,
      });
      setResult(booking);
      setStatus("sent");
    } catch (err) {
      console.error("submitReservationRequest failed", err);
      setStatus("error");
      setErrorMessage("We couldn't send your request — please try again in a moment.");
    }
  }

  return (
    <section id="reserve" style={{ background: t.dark ? t.surface : t.ink, padding: "72px 24px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: `'${t.display}', serif`, fontSize: "clamp(28px, 4.5vw, 40px)", color: t.dark ? t.ink : t.bg, margin: 0 }}>Reserve your table</h2>
        <p style={{ color: t.dark ? t.muted : `${t.bg}BB`, fontSize: 15, lineHeight: 1.6, margin: "12px 0 28px" }}>
          Send a request and {r.name} will confirm directly — no prepayment needed.
        </p>
        {status === "sent" ? (
          <div style={{ background: t.accent, color: "#fff", borderRadius: t.radius, padding: "22px 20px", fontWeight: 600, fontSize: 16 }}>
            Request sent. {r.name} will confirm your table for {form.party} shortly.
            {result?.reference && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Reference {result.reference}</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, textAlign: "left" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={label}>Your name</span>
              <input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={label}>Email</span>
              <input style={input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
            </div>
            <div>
              <span style={label}>Guests</span>
              <input style={input} value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} />
            </div>
            <div>
              <span style={label}>Date</span>
              <input style={input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <span style={label}>Time</span>
              <input style={input} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            {status === "error" && (
              <p style={{ gridColumn: "1 / -1", color: t.dark ? "#FF9B8A" : "#FFD9D2", fontSize: 13, fontWeight: 600, margin: 0 }}>
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "submitting"}
              style={{ gridColumn: "1 / -1", background: t.accent, color: "#fff", border: "none", borderRadius: t.radius, padding: "15px", fontSize: 15, fontWeight: 700, letterSpacing: "0.05em", cursor: status === "submitting" ? "default" : "pointer", opacity: status === "submitting" ? 0.7 : 1, fontFamily: `'${t.body}', sans-serif` }}
            >
              {status === "submitting" ? "Sending…" : "Send reservation request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
