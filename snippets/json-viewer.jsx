"use client";

// /snippets/json-viewer.jsx
import { useMemo, useState } from "react";

const isObject = (v) => v && typeof v === "object";

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

function renderNode({ k, v, depth = 0, defaultOpen = depth < 1 }) {
  if (!isObject(v)) {
    return (
      <div style={{ marginLeft: depth ? 16 : 0 }}>
        {k !== undefined && <span style={{ fontWeight: 600 }}>{k}: </span>}
        <Leaf value={v} />
      </div>
    );
  }

  const entries = Array.isArray(v) ? v.map((vv, i) => [i, vv]) : Object.entries(v);
  // local state hook must live in a component, so we wrap this branch:
  const Collapsible = () => {
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
            {entries.map(([ck, cv]) =>
              // recursive call returns JSX (not a JSX Component tag), so MDX won't try to resolve it
              <div key={ck}>
                {renderNode({ k: ck, v: cv, depth: depth + 1, defaultOpen: depth < 1 })}
              </div>
            )}
          </div>
        </details>
      </div>
    );
  };

  return <Collapsible />;
}

export const JsonViewer = ({ data, json, collapsedAt = 1 }) => {
  const value = useMemo(() => {
    if (isObject(data)) return data;
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
      {renderNode({ v: value, depth: 0, defaultOpen: collapsedAt <= 0 })}
    </div>
  );
};
