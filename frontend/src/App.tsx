import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { getMyActivities, saveActivity } from "./api/activities";
import { getCurrentUser, logout } from "./api/auth";
import { AppLayout } from "./components/AppLayout";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { ActivityDetailPage } from "./pages/ActivityDetailPage";
import { RecruitmentAnnouncementDetailPage } from "./pages/RecruitmentAnnouncementDetailPage";
import { HomePage } from "./pages/HomePage";
import { PlanningPage } from "./pages/PlanningPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { StaysPage } from "./pages/StaysPage";
import type { Activity } from "./types/activity";
import type { User } from "./types/user";

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [isLoadingMyActivities, setIsLoadingMyActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [savingActivityIds, setSavingActivityIds] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    let effectIsActive = true;

    getCurrentUser()
      .then((currentUser) => {
        if (effectIsActive) setUser(currentUser);
      })
      .catch(() => {
        if (effectIsActive) setUser(null);
      })
      .finally(() => {
        if (effectIsActive) setIsCheckingSession(false);
      });

    return () => {
      effectIsActive = false;
    };
  }, []);

  useEffect(() => {
    if (isCheckingSession) return;

    if (!user) {
      setMyActivities([]);
      setActivitiesError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoadingMyActivities(true);
    setActivitiesError(null);

    getMyActivities(controller.signal)
      .then(setMyActivities)
      .catch((caughtError: unknown) => {
        if (!controller.signal.aborted) {
          setActivitiesError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible d’ouvrir ta valise à activités.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingMyActivities(false);
      });

    return () => controller.abort();
  }, [isCheckingSession, user]);

  async function addActivityToSuitcase(activity: Activity): Promise<void> {
    if (!user) {
      navigate("/profil");
      return;
    }

    if (
      myActivities.some((savedActivity) => savedActivity.id === activity.id) ||
      savingActivityIds.includes(activity.id)
    ) {
      return;
    }

    setActivitiesError(null);
    setSavingActivityIds((ids) => [...ids, activity.id]);

    try {
      const result = await saveActivity(activity.id);
      setMyActivities((currentActivities) =>
        currentActivities.some(
          (currentActivity) => currentActivity.id === result.activity.id,
        )
          ? currentActivities
          : [result.activity, ...currentActivities],
      );
    } catch (caughtError) {
      setActivitiesError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d’ajouter cette activité à ta valise.",
      );
    } finally {
      setSavingActivityIds((ids) =>
        ids.filter((activityId) => activityId !== activity.id),
      );
    }
  }

  function handleActivitySaved(savedActivity: Activity): void {
    setMyActivities((currentActivities) => {
      const alreadyExists = currentActivities.some(
        (activity) => activity.id === savedActivity.id,
      );

      return alreadyExists
        ? currentActivities.map((activity) =>
            activity.id === savedActivity.id ? savedActivity : activity,
          )
        : [savedActivity, ...currentActivities];
    });
  }

  async function handleLogout(): Promise<void> {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      setUser(null);
      navigate("/");
    } catch (caughtError) {
      setLogoutError(
        caughtError instanceof Error
          ? caughtError.message
          : "La déconnexion a échoué.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <AppLayout
      isCheckingSession={isCheckingSession}
      isLoggingOut={isLoggingOut}
      logoutError={logoutError}
      onLogout={handleLogout}
      user={user}
    >
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              myActivities={myActivities}
              onSaveActivity={addActivityToSuitcase}
              savingActivityIds={savingActivityIds}
              user={user}
            />
          }
        />
        <Route path="/sejours" element={<StaysPage />} />
        <Route
          path="/activites"
          element={
            <ActivitiesPage
              activitiesError={activitiesError}
              isCheckingSession={isCheckingSession}
              isLoadingActivities={isLoadingMyActivities}
              myActivities={myActivities}
              onActivitySaved={handleActivitySaved}
              user={user}
            />
          }
        />
        <Route
          path="/activites/:activityId"
          element={
            <ActivityDetailPage
              myActivities={myActivities}
              onSaveActivity={addActivityToSuitcase}
              savingActivityIds={savingActivityIds}
              user={user}
            />
          }
        />
        <Route path="/planning" element={<PlanningPage />} />
        <Route
          path="/profil"
          element={
            <ProfilePage
              isCheckingSession={isCheckingSession}
              myActivities={myActivities}
              onUserChange={setUser}
              user={user}
            />
          }
        />
        <Route
          path="/annonces/:announcementId"
          element={<RecruitmentAnnouncementDetailPage user={user} />}
        />
        <Route path="/utilisateurs/:userId" element={<PublicProfilePage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AppLayout>
  );
}
