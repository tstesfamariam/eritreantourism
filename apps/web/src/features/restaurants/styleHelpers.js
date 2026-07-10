/**
 * styleHelpers.js — small style utilities shared across restaurant sections
 * (menu price formatting, theme texture backgrounds, gallery tile gradients).
 * Split out so Menu/Hero/Gallery don't each redefine the same helpers.
 */

export const fmt = (p) => (p % 1 === 0 ? `$${p}` : `$${p.toFixed(2)}`);

export function texStyle(t) {
  if (t.texture === "lines")
    return { backgroundImage: `repeating-linear-gradient(0deg, ${t.ink}08 0 1px, transparent 1px 28px)` };
  if (t.texture === "dots")
    return { backgroundImage: `radial-gradient(${t.ink}12 1px, transparent 1px)`, backgroundSize: "22px 22px" };
  return {};
}

export function galleryTone(t, tone) {
  const map = {
    a: `linear-gradient(135deg, ${t.accent}, ${t.accent}66)`,
    b: `linear-gradient(135deg, ${t.accent2}, ${t.accent2}66)`,
    c: `linear-gradient(135deg, ${t.accent}AA, ${t.accent2}AA)`,
    d: `linear-gradient(135deg, ${t.ink}CC, ${t.accent}88)`,
  };
  return map[tone] || map.a;
}
