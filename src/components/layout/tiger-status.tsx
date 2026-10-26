"use client";

import { useEffect, useState } from "react";

type Status = {
  configured: boolean;
  connected: boolean;
  provider: "tiger-data" | "mock";
  timescale: boolean;
};

export function TigerStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    void fetch("/api/tiger/health")
      .then((response) => response.json())
      .then((payload: Status) => setStatus(payload))
      .catch(() => setStatus({ configured: false, connected: false, provider: "mock", timescale: false }));
  }, []);

  if (!status) return <p className="form-note">Checking Tiger Data…</p>;
  if (status.connected) {
    return (
      <p className="tiger-pill on">
        Tiger Data {status.timescale ? "· Timescale" : "· PostgreSQL"} connected
      </p>
    );
  }
  return <p className="tiger-pill">Demo memory (Tiger Data offline)</p>;
}
