"use client";

// JSX snippet using ONLY arrow functions, per Mintlify docs.
// Import with:  import { JsonViewer } from "/snippets/json-viewer.jsx";
// Use with:     <JsonViewer json={`{ "hello": "world" }`} collapsedAt={1} />

import { useMemo, useState, useEffect } from "react";

export const JsonViewer = ({ json, collapsedAt = 1 }) => {
  // Parse only JSON strings to avoid MDX object-prop serialization issues
  const value = useMemo(() => {
    if (typeof json === "string") {
      try { return JSON.parse(json); } catch { return { error: "Invalid JSON string" }; }
    }
    return { error: "No JSON provided" };
  }, [json]);

  // Expanded paths (e.g., "$root.users.0")
  const [open, setOpen] = useState(() => new Set());

  // Seed expansion based on `collapsedAt`
  useEffect(() => {
    const next = new Set();
    const seed = (v, path = "$root", depth = 0) => {
      const isObj = v !== null && typeof v === "object";
      if (!isObj) return;
      if (depth < collapsedAt) next.add(path);
      const entries = Array.isArray(v) ? v : Object(v);
      const keys = Array.isArray(v) ? [...entries.keys()] : Object.keys(entries);
      for (const k of keys) {
        const child = Array.isArray(v) ? entries[k] : entries[k];
        seed(child, `${path}.${k}`, depth + 1);
      }
    };
    seed(value, "$root", 0);
    setOpen(next);
  }, [value, collapsedAt]);

  const toggle = (p) => setOpen(prev => {
    const next = new Set(prev);
    next.has(p) ? next.delete(p) : next.add(p);
    return next;
  });

  const Row = ({ indent, children }) => (
    <div style={{ paddingLeft: indent * 16, whiteSpace: "pre-wrap" }}>{children}</div>
  );

  const primitiveRender = (v) => {
    const t = v === null ? "null" : typeof v;
    const display = v === null ? "null" : t === "string" ? `"${v}"` : String(v);
    return <span>{display} <span style={{ opacity: 0.6 }}>({t})</span></span>;
  };

  const render = (v, path = "$root", depth = 0) => {
    const isObj = v !== null && typeof v === "object";
    if (!isObj) return <Row indent={depth}>{primitiveRender(v)}</Row>;

    const entries = Array.isArray(v)
      ? Array.from(v, (vv, i) => [String(i), vv])
      : Object.entries(v);

    const label = Array.isArray(v) ? `Array(${entries.length})` : `Object(${entries.length})`;
    const isOpen = open.has(path);

    return (
      <div>
        <Row indent={depth}>
          <button
            type="button"
            onClick={() => toggle(path)}
            aria-label={isOpen ? "Collapse" : "Expand"}
            style={{
              fontFamily: "inherit",
              fontSize: 14,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              marginRight: 6,
              lineHeight: 1
            }}
          >
            {isOpen ? "▾" : "▸"}
          </button>
          <span style={{ fontWeight: 600 }}>{label}</span>
        </Row>

        {isOpen && entries.map(([k, vv]) => (
          <div key={k}>
            <Row indent={depth + 1}>
              <span style={{ fontWeight: 600 }}>{k}: </span>
              {vv !== null && typeof vv === "object"
                ? render(vv, `${path}.${k}`, depth + 1)
                : primitiveRender(vv)}
            </Row>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 14,
      lineHeight: 1.5
    }}>
      {render(value, "$root", 0)}
    </div>
  );
};
