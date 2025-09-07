"use client";

import { useMemo, useState, useEffect } from "react";

export const JsonViewer = ({ json, collapsedAt = 1 }) => {
  const value = useMemo(() => {
    if (typeof json === "string") {
      try { return JSON.parse(json); } catch { return { error: "Invalid JSON string" }; }
    }
    if (json && typeof json === "object") return json;
    return { error: "No JSON provided" };
  }, [json]);

  const [open, setOpen] = useState(() => new Set());
  const [selected, setSelected] = useState({ name: null, path: null });

  useEffect(() => {
    const next = new Set();
    const seed = (v, path = "$root", depth = 0) => {
      const isObj = v !== null && typeof v === "object";
      if (!isObj) return;
      if (depth < collapsedAt) next.add(path);
      const entries = Array.isArray(v) ? v.map((vv, i) => [String(i), vv]) : Object.entries(v);
      for (const [k, child] of entries) seed(child, `${path}.${k}`, depth + 1);
    };
    seed(value, "$root", 0);
    setOpen(next);
  }, [value, collapsedAt]);

  const toggle = (p) => setOpen(prev => {
    const next = new Set(prev);
    next.has(p) ? next.delete(p) : next.add(p);
    return next;
  });

  const idForPath = (p) => `jv_${p.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const Row = ({ indent, onClick, children }) => (
    <div
      onClick={onClick}
      style={{
        paddingLeft: indent * 16,
        whiteSpace: "pre-wrap",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none"
      }}
    >
      {children}
    </div>
  );

  const TypeTag = ({ t }) => <span style={{ opacity: 0.6 }}>({t})</span>;

  const primitiveRender = (v) => {
    const t = v === null ? "null" : typeof v;
    const display = v === null ? "null" : t === "string" ? `"${v}"` : String(v);
    return <span>{display} <TypeTag t={t} /></span>;
  };

  const render = (v, path = "$root", depth = 0, itemName = "$root") => {
    const isObj = v !== null && typeof v === "object";
    if (!isObj) {
      return (
        <Row
          indent={depth}
          onClick={(e) => { e.stopPropagation(); setSelected({ name: itemName, path }); }}
        >
          {primitiveRender(v)}
        </Row>
      );
    }

    const entries = Array.isArray(v)
      ? v.map((vv, i) => [String(i), vv])
      : Object.entries(v);

    const label = Array.isArray(v) ? `Array(${entries.length})` : `Object(${entries.length})`;
    const isOpen = open.has(path);

    const btnId = `${idForPath(path)}_btn`;
    const regionId = `${idForPath(path)}_region`;

    return (
      <div>
        <Row
          indent={depth}
          onClick={(e) => { e.stopPropagation(); setSelected({ name: itemName, path }); }}
        >
          <button
            type="button"
            id={btnId}
            onClick={(e) => { e.stopPropagation(); toggle(path); }}
            aria-label={isOpen ? "Collapse" : "Expand"}
            aria-expanded={isOpen}
            aria-controls={regionId}
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

        {isOpen && (
          <div id={regionId} role="region" aria-labelledby={btnId}>
            {entries.map(([k, vv]) => {
              const childPath = `${path}.${k}`;
              const childName = k;
              const isChildObj = vv !== null && typeof vv === "object";

              return (
                <div key={k}>
                  <Row
                    indent={depth + 1}
                    onClick={(e) => { e.stopPropagation(); setSelected({ name: childName, path: childPath }); }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {Array.isArray(v) ? k : `"${k}"`}:
                    </span>{" "}
                    {isChildObj
                      ? render(vv, childPath, depth + 1, childName)
                      : primitiveRender(vv)}
                  </Row>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 14,
      lineHeight: 1.5
    }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--mintlify-background, #fff)",
          padding: "6px 0",
          marginBottom: 8,
          borderBottom: "1px solid rgba(0,0,0,0.08)"
        }}
      >
        <strong>Clicked item:</strong>{" "}
        {selected.name ? (
          <>
            <span style={{ fontWeight: 600 }}>{selected.name}</span>{" "}
            <span style={{ opacity: 0.6 }}>[{selected.path}]</span>
          </>
        ) : (
          <span style={{ opacity: 0.6 }}>—</span>
        )}
      </div>

      {render(value, "$root", 0, "$root")}
    </div>
  );
};
