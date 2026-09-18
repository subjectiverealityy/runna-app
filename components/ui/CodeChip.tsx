export function CodeChip({ children, tone = "navy" }: { children: React.ReactNode; tone?: "navy" | "amber" }) {
  return (
    <span
      className="font-mono text-sm px-2.5 py-1 rounded-md tracking-wide"
      style={{ background: tone === "amber" ? "#F2A93B" : "#1E2A4A", color: tone === "amber" ? "#141C30" : "#fff" }}
    >
      {children}
    </span>
  );
}
