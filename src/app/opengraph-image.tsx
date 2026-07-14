import { ImageResponse } from "next/og";

export const alt = "Fluebaze — Influencer campaign management for growing brands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#171a17", background: "#f5f5ef", fontFamily: "sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}><span style={{ width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#171a17", background: "#b9f34a" }}>F</span>Fluebaze</div><div style={{ display: "flex", flexDirection: "column", gap: 24 }}><div style={{ fontSize: 66, lineHeight: 1.02, fontWeight: 700, maxWidth: 970 }}>Every influencer collaboration. One simple workspace.</div><div style={{ display: "flex", fontSize: 25, color: "#555b53" }}>Outreach · Deliverables · Approvals · Payments · Results</div></div></div>, size);
}
