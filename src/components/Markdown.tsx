import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    return p;
  });
}

/** Minimal, safe markdown renderer (headings, lists, quotes, bold, code). No raw HTML. */
export function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);
  return (
    <div className="prose-lesson">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (b.startsWith("## ")) {
          return (
            <div key={i}>
              <h2>{inline((lines[0] ?? "").slice(3))}</h2>
              {lines.slice(1).length > 0 && <Markdown source={lines.slice(1).join("\n")} />}
            </div>
          );
        }
        if (lines.every((l) => l.startsWith("- ")))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        if (b.startsWith("> ")) return <blockquote key={i}>{inline(b.slice(2))}</blockquote>;
        return <p key={i}>{inline(b)}</p>;
      })}
    </div>
  );
}
