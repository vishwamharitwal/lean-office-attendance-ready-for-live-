"use client";

import * as React from "react";
import { Clock, LogIn, LogOut, CheckCircle, MapPin, MapPinOff, AlertCircle } from "lucide-react";
import { ChipLoader } from "@/components/ui/chip-loader";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuBadge } from "@/components/ui/neu-badge";

interface TodayRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: "present" | "absent" | "late";
  hoursWorked: number;
  outOfOffice?: boolean;
  location?: { lat: number | null; lng: number | null };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CheckInOutPanel() {
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [todayRecord, setTodayRecord] = React.useState<TodayRecord | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  // GPS Location state & toggle
  const [enableLocation, setEnableLocation] = React.useState<boolean>(true);
  const [locStatus, setLocStatus] = React.useState<string | null>(null);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    fetchTodayRecord();
  }, []);

  // Try to acquire position in advance if location is enabled
  React.useEffect(() => {
    if (enableLocation && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocStatus(`GPS Acquired (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          console.warn("Location permission or signal:", err.message);
          setLocStatus("GPS permission not granted yet");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setCoords(null);
      setLocStatus(null);
    }
  }, [enableLocation]);

  const fetchTodayRecord = async () => {
    try {
      const today = new Date();
      const month = today.toISOString().slice(0, 7);
      const response = await fetch(`/api/attendance?month=${month}`);
      const data = await response.json();

      if (data.success && data.data?.records) {
        const todayStr = today.toISOString().split("T")[0];
        const todayRec = data.data.records.find(
          (r: TodayRecord) => r.date === todayStr
        );
        setTodayRecord(todayRec || null);
      }
    } catch (error) {
      console.error("Error fetching today's record:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const getExactLocation = (): Promise<{ lat: number; lng: number } | null> => {
    if (!enableLocation || typeof window === "undefined" || !navigator.geolocation) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(loc);
          resolve(loc);
        },
        (err) => {
          console.warn("Could not retrieve exact location at check-in:", err.message);
          resolve(coords); // Fallback to pre-acquired coords if available
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let payload: { lat?: number; lng?: number } = {};

      if (enableLocation) {
        const liveCoords = await getExactLocation();
        if (liveCoords) {
          payload = { lat: liveCoords.lat, lng: liveCoords.lng };
        }
      }

      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTodayRecord();
      } else {
        setErrorMessage(data.error || "Failed to check in");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      setErrorMessage("Failed to check in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        await fetchTodayRecord();
      } else {
        setErrorMessage(data.error || "Failed to check out");
      }
    } catch (error) {
      console.error("Check-out error:", error);
      setErrorMessage("Failed to check out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = todayRecord !== null;
  const isCheckedOut = todayRecord?.checkOut !== null;
  const isCompleted = isCheckedIn && isCheckedOut;

  const getStatusInfo = () => {
    if (!isCheckedIn) {
      return {
        text: "Not Checked In",
        color: "text-[var(--neu-text-muted)]",
      };
    }
    if (!isCheckedOut) {
      return {
        text: `Checked In at ${formatShortTime(todayRecord.checkIn)}`,
        color: "text-[var(--neu-success)]",
      };
    }
    return {
      text: `Checked Out — ${todayRecord.hoursWorked.toFixed(1)}h worked`,
      color: "text-[var(--neu-accent)]",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <NeuCard className="w-full">
      <NeuCardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Live Clock */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-[var(--neu-accent)]" />
              <span className="text-3xl md:text-5xl font-bold text-[var(--neu-text)] tracking-tight" suppressHydrationWarning>
                {currentTime ? formatTime(currentTime) : "--:--:-- --"}
              </span>
            </div>
            <p className="text-lg text-[var(--neu-text-secondary)]" suppressHydrationWarning>
              {currentTime ? formatDate(currentTime) : "Loading..."}
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <span className={`text-lg font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            {isCheckedIn && (
              <NeuBadge variant={todayRecord.status}>
                {todayRecord.status
                  ? todayRecord.status.charAt(0).toUpperCase() + todayRecord.status.slice(1)
                  : "Checked In"}
              </NeuBadge>
            )}
            {isCheckedIn && todayRecord.location?.lat && (
              <NeuBadge variant={todayRecord.outOfOffice ? "warning" : "success"}>
                {todayRecord.outOfOffice ? "Out of Office" : "In Office"}
              </NeuBadge>
            )}
          </div>

          {/* Location Toggle (Visible before check-in) */}
          {!isCheckedIn && !initialLoading && (
            <div className="w-full max-w-md p-4 rounded-xl bg-[var(--neu-bg)] border border-[var(--neu-border)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${enableLocation ? "bg-[var(--neu-accent)]/10 text-[var(--neu-accent)]" : "bg-gray-100 text-gray-400"}`}>
                  {enableLocation ? <MapPin className="w-5 h-5" /> : <MapPinOff className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--neu-text)]">
                      GPS Location Check
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${enableLocation ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                      {enableLocation ? "ENABLED" : "OFF"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                    {enableLocation
                      ? locStatus || "Will capture your office coordinates on check-in"
                      : "Location disabled — check in freely without GPS"}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setEnableLocation(!enableLocation)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableLocation ? "bg-[var(--neu-accent)]" : "bg-gray-300"
                }`}
                title={enableLocation ? "Disable GPS" : "Enable GPS"}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    enableLocation ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="w-full max-w-md p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Check-in Alert</p>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          {initialLoading ? (
            <div className="w-full">
              <ChipLoader size="sm" />
            </div>
          ) : isCompleted ? (
            <NeuButton
              size="lg"
              disabled
              className="w-48 h-14 text-lg opacity-60"
            >
              <CheckCircle className="w-5 h-5" />
              Completed for today
            </NeuButton>
          ) : !isCheckedIn ? (
            <NeuButton
              variant="accent"
              size="lg"
              loading={loading}
              onClick={handleCheckIn}
              className="w-48 h-14 text-lg bg-[var(--neu-success)] hover:brightness-110"
            >
              <LogIn className="w-5 h-5" />
              Check In
            </NeuButton>
          ) : (
            <NeuButton
              size="lg"
              loading={loading}
              onClick={handleCheckOut}
              className="w-48 h-14 text-lg bg-[var(--neu-warning)] text-[var(--neu-bg)] hover:brightness-110"
            >
              <LogOut className="w-5 h-5" />
              Check Out
            </NeuButton>
          )}
        </div>
      </NeuCardContent>
    </NeuCard>
  );
}
