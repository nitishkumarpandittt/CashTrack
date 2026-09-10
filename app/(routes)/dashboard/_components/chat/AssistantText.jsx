"use client";

/** Bold runs (**text**) inside a single line, without dangerouslySetInnerHTML. */
export function renderInline(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-bold text-[var(--cash-ink)]">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
}

/**
 * Coach replies arrive as light markdown: bold, `-`/`*` bullets, `1.` steps
 * and the odd `#` heading. Rendering the raw symbols looks broken, so parse
 * those few constructs into paragraphs and lists; anything else is plain text.
 */
function AssistantText({ text, className = "" }) {
  const blocks = [];
  let list = null;

  for (const rawLine of String(text ?? "").split("\n")) {
    const line = rawLine.replace(/^\s*#{1,6}\s+(.*)$/, "**$1**");
    const bullet = line.match(/^\s*[*-]\s+(.*)/);
    const step = line.match(/^\s*(\d+)[.)]\s+(.*)/);
    const item = bullet ? { text: bullet[1] } : step ? { text: step[2], n: step[1] } : null;
    const kind = bullet ? "ul" : step ? "ol" : null;

    if (item) {
      if (!list || list.kind !== kind) {
        list = { kind, items: [] };
        blocks.push({ type: "list", ...list });
      }
      list.items.push(item);
    } else {
      list = null;
      if (line.trim()) blocks.push({ type: "p", text: line });
    }
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {blocks.map((block, i) =>
        block.type === "list" ? (
          block.kind === "ol" ? (
            <ol key={i} className="space-y-1.5">
              {block.items.map((entry, j) => (
                <li key={j} className="flex gap-2.5">
                  <span className="w-5 shrink-0 text-right font-display text-xs font-bold leading-6 text-[var(--cash-teal)]">
                    {entry.n}.
                  </span>
                  <span className="min-w-0">{renderInline(entry.text)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <ul key={i} className="space-y-1.5">
              {block.items.map((entry, j) => (
                <li key={j} className="flex gap-2.5">
                  <span
                    className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cash-teal)]"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{renderInline(entry.text)}</span>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p key={i}>{renderInline(block.text)}</p>
        )
      )}
    </div>
  );
}

export default AssistantText;
