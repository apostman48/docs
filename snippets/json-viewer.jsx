"use client";

import { useMemo, useState, useEffect } from "react";

export default function JsonViewer({ data, json, collapsedAt = 1 }) {
  // Parse input
  const value = useMemo(() => {
    if (data && typeof data === "object") return data;
    if (typeof json === "string") {
      try { return JSON.parse(json); } catch { return { error: "Invalid JSON string" }; }
    }
    return {};
  }, [data, json]);

  // Track which paths are expanded: a Set of "a.b.0.c" strings
  const [open, setOpen] = useState(() => new Set());

  // Initialize expansion according to `collapsedAt`
  useEffect(() => {
    const next = new Set();
    // Open all nodes shallower than collapsedAt
    function seed(v, path = "", depth = 0) {
      const isContainer = v !== null && typeof v === "object";
      if (!isContainer) return;
      if (depth < collapsedAt) next.add(path || "$root");
      const entries = Array.isArray(v) ? v : Object(v);
      for (const k of Array.isArray(v) ? v.keys() : Object.keys(entries)) {
        const child = Array.isArray(v) ? v[k] : entries[k];
        seed(child, path ? `${path}.${k}` : String(k), depth + 1);
      }
    }
    seed(value, "", 0);
    setOpen(next);
  }, [value, collapsedAt]);

  const toggle = (path) => {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const row = ({ indent, left, right }) => (
    <div style={{ paddingLeft: indent * 16, whiteSpace: "pre-wrap" }}>
      {left}{right}
    </div>
  );

  function render(v, path = "$root", depth = 0) {
    const isContainer = v !== null && typeof v === "object";
    if (!isContainer) {
      const t = v === null ? "null" : typeof v;
      const display = v === null ? "null" : t === "string" ? `"${v}"` : String(v);
      return row({
        indent: depth,
        left: <span>{display}</span>,
        right: <span style={{ opacity: 0.6 }}> ({t})</span>
      });
    }

    const entries = Array.isArray(v)
      ? Array.from(v, (vv, i) => [String(i), vv])
      : Object.entries(v);

    const label = Array.isArray(v) ? `Array(${entries.length})` : `Object(${entries.length})`;
    const isOpen = open.has(path);

    const caret = (
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
    );

    const header = (
      <span>
        {caret}
        <span style={{ fontWeight: 600 }}>{label}</span>
      </span>
    );

    const children = isOpen
      ? entries.map(([k, vv]) => (
          <div key={k}>
            <div style={{ paddingLeft: (depth + 1) * 16 }}>
              <span style={{ fontWeight: 600 }}>{k}: </span>
              {/* render child inline if primitive, otherwise render its own header and potential subtree */}
              {vv !== null && typeof vv === "object"
                ? render(vv, `${path}.${k}`, depth + 1)
                : (() => {
                    const t = vv === null ? "null" : typeof vv;
                    const display = vv === null ? "null" : t === "string" ? `"${vv}"` : String(vv);
                    return (
                      <span>
                        {display}
                        <span style={{ opacity: 0.6 }}> ({t})</span>
                      </span>
                    );
                  })()}
            </div>
          </div>
        ))
      : null;

    return (
      <div>
        {row({ indent: depth, left: header })}
        {children}
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 14,
      lineHeight: 1.5
    }}>
      {render(value, "$root", 0)}
    </div>
  );
}
