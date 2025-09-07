"use client";

import { useMemo, useState } from "react";

const isObject = (v) => v && typeof v === "object";

const Key = ({ name }) => <span style={{ fontWeight: 600 }}>{name}</span>;
const Type = ({ t }) => <span style={{ opacity: 0.6 }}> {t}</span>;

const Leaf = ({ value }) => {
  const t = value === null ? "null" : typeof value;
  const display =
    value === null ? "null" : t === "string" ? `"${value}"` : String(value);
  return (
    <span>
      {display}
      <Type t={`(${t})`} />
    </span>
  );
};

const Node = ({ k, v, depth = 0, defaultOpen = depth < 1 }) => {
  if (!isObject(v)) {
    return (
      <div style={{ marginLeft: depth ? 16 : 0 }}>
        {k !== undefined && <Key name={`${k}: `} />}
        <Leaf value={v} />
      </div>
    );
  }
  const entries = Array.isArray(v) ? v.map((vv, i) => [i, vv]) : Object.entries(v);
  const [open, setOpen] = useState(defaultOpen);
  const label = Array.isArray(v) ? `Array(${entries.length})` : `Object(${entries.length})`;
  return (
    <div style={{ marginLeft: depth ? 16 : 0 }}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary style={{ cursor: "pointer" }}>
          {k !== undefined && <Key name={`${k}: `} />}
          <span>{label}</span>
        </summary>
        <div style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", marginLeft: 8, paddingLeft: 8 }}>
          {entries.map(([ck, cv]) => (
            <Node key={ck} k={ck} v={cv} depth={depth + 1} defaultOpen={depth < 1} />
          ))}
        </div>
      </details>
    </div>
  );
};

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
      <Node v={value} depth={0} defaultOpen={collapsedAt <= 0} />
    </div>
  );
};
