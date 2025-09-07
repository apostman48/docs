"use client";

import { useMemo, useState } from "react";

function Leaf({ value }) {
  const t = value === null ? "null" : typeof value;
  const display =
    value === null ? "null" : t === "string" ? `"${value}"` : String(value);
  return (
    <span>
      {display}
      <span style={{ opacity: 0.6 }}> ({t})</span>
    </span>
  );
}

function Collapsible({ k, v, depth, defaultOpen }) {
  const entries = Array.isArray(v) ? v.map((vv, i) => [i, vv]) : Object.entries(v);
  const [open, setOpen] = useState(defaultOpen);
  const label = Array.isArray(v) ? `Array(${entries.length})` : `Object(${entries.length})`;

  return (
    <div style={{ marginLeft: depth ? 16 : 0 }}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary style={{ cursor: "pointer" }}>
          {k !== undefined && <span style={{ fontWeight: 600 }}>{k}: </span>}
          <span>{label}</span>
        </summary>
        <div style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", marginLeft: 8, paddingLeft: 8 }}>
          {entries.map(([ck, cv]) => (
            <div key={ck}>
              {renderNode(ck, cv, depth + 1, depth < 1)}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function renderNode(k, v, depth = 0, defaultOpen = depth < 1) {
  const isContainer = v !== null && typeof v === "object";
  if (!isContainer) {
    return (
      <div style={{ marginLeft: depth ? 16 : 0 }}>
        {k !== undefined && <span style={{ fontWeight: 600 }}>{k}: </span>}
        <Leaf value={v} />
      </div>
    );
  }
  return <Collapsible k={k} v={v} depth={depth} defaultOpen={defaultOpen} />;
}

export default function JsonViewer({ data, json, collapsedAt = 1 }) {
  const value = useMemo(() => {
    if (data && typeof data === "object") return data;
    if (typeof json === "string") {
      try { return JSON.parse(json); } catch { return { error: "Invalid JSON string" }; }
    }
    return {};
  }, [data, json]);

  return (
    <div style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 14,
      lineHeight: 1.5
    }}>
      {renderNode(undefined, value, 0, collapsedAt <= 0)}
    </div>
  );
}
