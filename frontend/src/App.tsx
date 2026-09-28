import { useEffect, useState } from "react";

import { getActivities } from "./api/activities";
import type { Activity } from "./types/activity";

export default function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadActivities(signal?: AbortSignal): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getActivities(signal);
      setActivities(data);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de charger les activités.",
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadActivities(controller.signal);

    return () => controller.abort();
  }, []);

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Pocket</p>
          <h1>Activités</h1>
        </div>

        <button type="button" onClick={() => void loadActivities()}>
          Actualiser
        </button>
      </header>

      {isLoading && <p>Chargement des activités…</p>}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <section aria-labelledby="loaded-activities-title">
          <h2 id="loaded-activities-title">
            {activities.length} activité{activities.length > 1 ? "s" : ""} chargée
            {activities.length > 1 ? "s" : ""}
          </h2>

          <pre>{JSON.stringify(activities, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
