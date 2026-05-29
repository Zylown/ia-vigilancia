"use client";

import { useEffect, useState } from "react";

type Health = {
  status: string;
  camera_source: string;
  fps: number;
  device: string;
  fight_model_enabled: boolean;
  enabled_events: string[];
  error: string | null;
};

type CameraOption = {
  source: string;
  label: string;
};

type EventItem = {
  code: string;
  title: string;
  priority: string;
  detail: string;
  created_at: string;
  evidence_path: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const cameras = [
  {
    name: "Camara principal",
    location: "Prototipo local",
    source: "Camo / webcam / RTSP",
  },
  {
    name: "Biblioteca Norte",
    location: "Pendiente",
    source: "RTSP futuro",
  },
  {
    name: "Laboratorio 3",
    location: "Pendiente",
    source: "RTSP futuro",
  },
];

export function LiveDashboard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [cameraOptions, setCameraOptions] = useState<CameraOption[]>([]);
  const [selectedSource, setSelectedSource] = useState("0");
  const [manualSource, setManualSource] = useState("");
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [streamVersion, setStreamVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [healthResponse, eventsResponse] = await Promise.all([
          fetch(`${API_URL}/api/health`, { cache: "no-store" }),
          fetch(`${API_URL}/api/events`, { cache: "no-store" }),
        ]);

        if (!cancelled) {
          const nextHealth = await healthResponse.json();
          setHealth(nextHealth);
          setSelectedSource(nextHealth.camera_source ?? "0");
          setEvents(await eventsResponse.json());
        }
      } catch {
        if (!cancelled) {
          setHealth(null);
          setEvents([]);
        }
      }
    }

    loadData();
    const intervalId = window.setInterval(loadData, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    loadCameras();
  }, []);

  async function loadCameras() {
    try {
      const response = await fetch(`${API_URL}/api/cameras`, { cache: "no-store" });
      setCameraOptions(await response.json());
    } catch {
      setCameraOptions([]);
    }
  }

  async function changeCamera(source: string) {
    const trimmedSource = source.trim();
    if (!trimmedSource) {
      return;
    }

    setIsSwitchingCamera(true);
    try {
      const response = await fetch(`${API_URL}/api/camera`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: trimmedSource }),
      });
      const nextHealth = await response.json();
      setHealth(nextHealth);
      setSelectedSource(trimmedSource);
      setManualSource("");
      setStreamVersion((version) => version + 1);
    } finally {
      setIsSwitchingCamera(false);
    }
  }

  const cameraStatus = health?.status === "running" ? "En vivo" : "Sin conexion";
  const priority = events[0]?.priority ?? "Baja";

  return (
    <main className="min-h-screen px-5 py-6 text-[#151917] md:px-10">
      <header className="mx-auto flex max-w-7xl flex-col gap-5 border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#28775d]">
            IA Vigilancia
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Dashboard de monitoreo universitario
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric label="FPS" value={String(health?.fps ?? 0)} tone="neutral" />
          <Metric label="Eventos" value={String(events.length)} tone={events.length ? "danger" : "success"} />
          <Metric label="Prioridad" value={capitalize(priority)} tone={priority === "alta" ? "danger" : "success"} />
        </div>
      </header>

      <section className="mx-auto mt-6 grid max-w-7xl items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <div className="overflow-hidden rounded-lg border border-black/10 bg-[#151917] shadow-sm">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
            <div>
              <p className="text-sm text-white/60">Vista principal</p>
              <h2 className="text-xl font-bold">Camara principal</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${health ? "bg-[#28775d]" : "bg-[#c7352c]"}`}>
              {cameraStatus}
            </span>
          </div>
          <div className="aspect-video bg-[#101412]">
            <img
              src={`${API_URL}/video_feed?v=${streamVersion}`}
              alt="Stream en vivo de la camara"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <aside className="max-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-black/10 bg-[var(--panel)] p-5 shadow-sm">
          <div className="mb-5 rounded-md border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--ink-muted)]">
                  Camara activa
                </p>
                <p className="mt-1 font-black">{health?.camera_source ?? "Sin API"}</p>
              </div>
              <button
                className="rounded-md bg-[#26342e] px-3 py-2 text-sm font-bold text-white"
                onClick={loadCameras}
                type="button"
              >
                Escanear
              </button>
            </div>

            <select
              className="mt-4 w-full rounded-md border border-black/20 bg-white px-3 py-2"
              value={selectedSource}
              onChange={(event) => changeCamera(event.target.value)}
              disabled={!health || isSwitchingCamera}
            >
              <option value={selectedSource}>Fuente actual: {selectedSource}</option>
              {cameraOptions.map((camera) => (
                <option key={camera.source} value={camera.source}>
                  {camera.label}
                </option>
              ))}
            </select>

            <div className="mt-3 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-md border border-black/20 bg-white px-3 py-2"
                placeholder="Indice o URL RTSP/HTTP"
                value={manualSource}
                onChange={(event) => setManualSource(event.target.value)}
              />
              <button
                className="rounded-md bg-[#28775d] px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                disabled={!health || isSwitchingCamera || !manualSource.trim()}
                onClick={() => changeCamera(manualSource)}
                type="button"
              >
                Usar
              </button>
            </div>

            {health?.error ? (
              <p className="mt-3 rounded-md bg-[#c7352c]/10 p-3 text-sm font-semibold text-[#c7352c]">
                {health.error}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Eventos</h2>
            <span className="rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Tiempo real
            </span>
          </div>
          <div className="mt-5 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="rounded-md border border-black/10 bg-white p-4">
                <p className="font-bold">Sin eventos recientes</p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  El backend esta esperando detecciones relevantes.
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={`${event.code}-${event.created_at}-${event.detail}`}
                  className="rounded-md border border-black/10 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{event.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-muted)]">
                        {event.created_at} - {event.detail}
                      </p>
                    </div>
                    <PriorityBadge priority={event.priority} />
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-black/10 bg-[var(--panel)] p-5 shadow-sm">
          <h2 className="text-2xl font-black">Camaras</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {cameras.map((camera, index) => (
              <article
                key={camera.name}
                className="rounded-md border border-black/10 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black">{camera.name}</h3>
                  <span className={`h-3 w-3 rounded-full ${index === 0 && health ? "bg-[#28775d]" : "bg-black/20"}`} />
                </div>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  {camera.location}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <Info label="Estado" value={index === 0 ? cameraStatus : "Pendiente"} />
                  <Info label="Fuente" value={index === 0 ? health?.camera_source ?? "Sin datos" : camera.source} />
                  <Info label="Modelo pelea" value={index === 0 && health?.fight_model_enabled ? "Activo" : "Pendiente"} />
                </dl>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-[#26342e] p-5 text-white shadow-sm">
          <h2 className="text-2xl font-black">Motor IA</h2>
          <div className="mt-5 space-y-3">
            <InfoDark label="Dispositivo" value={health?.device ?? "Sin conexion"} />
            <InfoDark label="Eventos activos" value={health?.enabled_events?.join(", ") ?? "Sin datos"} />
            <InfoDark label="API" value={API_URL} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "success" | "danger";
}) {
  const color =
    tone === "success" ? "text-[#28775d]" : tone === "danger" ? "text-[#c7352c]" : "text-[#151917]";

  return (
    <div className="min-w-24 rounded-md border border-black/10 bg-white/70 px-4 py-3">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--ink-muted)]">
        {label}
      </p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles =
    priority === "alta"
      ? "bg-[#c7352c] text-white"
      : priority === "baja"
        ? "bg-[#28775d] text-white"
        : "bg-[#b98214] text-white";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${styles}`}>
      {capitalize(priority)}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-t border-black/10 pt-2">
      <dt className="text-[var(--ink-muted)]">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}

function InfoDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-2 break-words font-bold text-white">{value}</p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
