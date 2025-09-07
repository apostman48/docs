"use client";

import { useMemo, useState, useEffect } from "react";

export default function JsonViewer({ json, collapsedAt = 1 }) {
  // Parse JSON string only (no object props, to avoid MDX serialization issues)
  const value = useMemo(() => {
    if (typeof json === "string") {
      try { return JSON.parse(json); } catch { return { error: "Invalid JSON string" }; }
    }
    return { error: "No JSON provided" };
  }, [json]);

  // Track expanded paths
  const [open, setOpen] = useState(() => new Set());

  // Seed open paths based on collapsedAt
  useEffect(() => {
    const next = new Set();
    function seed(v, path = "$root", depth = 0) {
      const isObj = v !== null && typeof v === "object";
      if (!isObj) return;
      if (depth < collapsedAt) next.add(path);
      const entries = Array.isArray(v) ? v : Object(v);
      const keys = Array.isArray(v) ? [...entries.keys()] : Object.keys(entries);
      for (const k of keys) {
        const child = Array.isArray(v) ? v[k] : entries[k];
        seed(child, `${path}.${k}`, depth + 1);
      }
    }
    seed(value, "$root", 0);
    setOpen(next);
  }, [value, collapsedAt]);

  const toggle = (path) => {
    setOpen(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const Row = ({ indent, children }) => (
    <div style={{ paddingLeft: indent * 16, whiteSpace: "pre-wrap" }}>{children}</div>
  );

  function render(v, path = "$root", depth = 0) {
    const isObj = v !== null && typeof v === "object";
    if (!isObj) {
      const t = v === null ? "null" : typeof v;
      const display = v === null ? "null" : t === "string" ? `"${v}"` : String(v);
      return <Row indent={depth}>{display} <span style={{opacity:.6}}>({t})</span></Row>;
    }

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
            style={{ fontFamily:"inherit", fontSize:14, border:"none", background:"transparent", cursor:"pointer", padding:0, marginRight:6 }}
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
                : (() => {
                    const t = vv === null ? "null" : typeof vv;
                    const display = vv === null ? "null" : t === "string" ? `"${vv}"` : String(vv);
                    return <span>{display} <span style={{opacity:.6}}>({t})</span></span>;
                  })()}
            </Row>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize:14, lineHeight:1.5 }}>
      {render(value, "$root", 0)}
    </div>
  );
}

// Handy demo JSON exports in case you prefer importing strings from the snippet
export const DEMO_JSON = `{
  "meta": { "requestId": "req_9c1e2c0f", "receivedAt": "2025-09-07T10:31:00Z" },
  "user": {
    "id": 123456,
    "name": { "first": "Ada", "last": "Lovelace" },
    "roles": ["admin", "analyst"],
    "profile": { "bio": "Mathematician", "lastLoginAt": null }
  },
  "projects": [
    { "id": "prj_1", "name": "Analytical Engine", "stats": { "issuesOpen": 12 } },
    { "id": "prj_2", "name": "Notes on Babbage", "stats": { "issuesOpen": 0 } }
  ]
}`;
