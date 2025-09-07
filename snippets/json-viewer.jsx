"use client";

import { useMemo, useState, useEffect } from "react";

// keep your JsonViewer definition here …
// (same as last version I gave you)

export default function JsonViewer({ data, json, collapsedAt = 1 }) {
  // ... same logic ...
}

// ✅ Export demo data so MDX can import them safely
export const demoObject = {
  meta: { requestId: "req_9c1e2c0f", receivedAt: "2025-09-07T10:31:00Z" },
  user: {
    id: 123456,
    name: { first: "Ada", last: "Lovelace" },
    roles: ["admin", "analyst"],
    profile: { bio: "Mathematician", lastLoginAt: null }
  },
  projects: [
    { id: "prj_1", name: "Analytical Engine", stats: { issuesOpen: 12 } },
    { id: "prj_2", name: "Notes on Babbage", stats: { issuesOpen: 0 } }
  ]
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
    score: ((i * 137) % 1000) / 10
  })),
  paging: { page: 1, pageSize: 10, total: 5000 }
};

export const demoInvalidJson = `{ "oops": true, trailing: }`;
