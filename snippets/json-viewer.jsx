"use client";

import { useMemo, useState, useEffect } from "react";

// ------------------------------
// JSON Viewer Component
// ------------------------------
export default function JsonViewer({ data, json, collapsedAt = 1 }) {
  const value = useMemo(() => {
    if (data && typeof data === "object") return data;
    if (typeof json === "string") {
      try {
        return JSON.parse(json);
      } catch {
        return { error: "Invalid JSON string" };
      }
    }
    return {};
  }, [data, json]);

  // Track open/closed state
  const [open, setOpen] = useState(() => new Set());

  // Initialize expansion
  useEffect(() => {
    const next = new Set();
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
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const row = ({ indent, left, right }) => (
    <div style={{ paddingLeft: indent * 16, whiteSpace: "pre-wrap" }}>
      {left}
      {right}
    </div>
  );

  function render(v, path = "$root", depth = 0) {
    const isContainer = v !== null && typeof v === "object";
    if (!isContainer) {
      const t = v === null ? "null" : typeof v;
      const display =
        v === null ? "null" : t === "string" ? `"${v}"` : String(v);
      return row({
        indent: depth,
        left: <span>{display}</span>,
        right: <span style={{ opacity: 0.6 }}> ({t})</span>,
      });
    }

    const entries = Array.isArray(v)
      ? Array.from(v, (vv, i) => [String(i), vv])
      : Object.entries(v);

    const label = Array.isArray(v)
      ? `Array(${entries.length})`
      : `Object(${entries.length})`;
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
          lineHeight: 1,
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
              {vv !== null && typeof vv === "object"
                ? render(vv, `${path}.${k}`, depth + 1)
                : (() => {
                    const t = vv === null ? "null" : typeof vv;
                    const display =
                      vv === null
                        ? "null"
                        : t === "string"
                        ? `"${vv}"`
                        : String(vv);
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
    <div
      style={{
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {render(value, "$root", 0)}
    </div>
  );
}

// ------------------------------
// Exported demo data
// ------------------------------
export const demoObject = {
  meta: { requestId: "req_9c1e2c0f", receivedAt: "2025-09-07T10:31:00Z" },
  user: {
    id: 123456,
    name: { first: "Ada", last: "Lovelace" },
    roles: ["admin", "analyst"],
    profile: { bio: "Mathematician", lastLoginAt: null },
  },
  projects: [
    { id: "prj_1", name: "Analytical Engine", stats: { issuesOpen: 12 } },
    { id: "prj_2", name: "Notes on Babbage", stats: { issuesOpen: 0 } },
  ],
};

export const demoJson = `{
  "status": "ok",
  "version": "2.1.0",
  "endpoints": [
    {"path": "/v2/users", "method": "GET"},
    {"path": "/v2/projects/:id", "method": "PATCH"}
  ]
}`;

export const demoLargeArray = {
  results: Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    ok: (i % 3) !== 0,
    score: ((i * 137) % 1000) / 10,
  })),
  paging: { page: 1, pageSize: 10, total: 5000 },
};

export const demoInvalidJson = `{ "oops": true, trailing: }`;
