"use client";

import { useState, useEffect } from "react";
import { Settings, MapPin, Loader2, AlertTriangle, Save } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuBadge } from "@/components/ui/neu-badge";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuToast } from "@/components/ui/neu-toast";

interface LocationSettings {
  officeLat: number;
  officeLng: number;
  radiusMeters: number;
  strictGeofence: boolean;
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Location settings state
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    officeLat: 0,
    officeLng: 0,
    radiusMeters: 100,
    strictGeofence: false,
  });

  // Fetch settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/location");
        const data = await response.json();

        if (data.success) {
          setLocationSettings(data.data);
        }
      } catch (error) {
        setToast({ message: "Failed to load settings", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save location settings
  const handleSaveLocationSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationSettings),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: "Location settings saved successfully", type: "success" });
      } else {
        setToast({ message: data.error || "Failed to save settings", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Failed to save settings", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--neu-accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <NeuToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--neu-text)] flex items-center gap-2">
          <Settings className="w-6 h-6" />
          System Settings
        </h1>
        <p className="text-[var(--neu-text-secondary)]">
          Configure geolocation, email, and other system preferences
        </p>
      </div>

      {/* Geo-location Settings */}
      <NeuCard>
        <NeuCardHeader>
          <NeuCardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Geo-location Settings
          </NeuCardTitle>
        </NeuCardHeader>
        <NeuCardContent>
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Geofence Configuration</p>
                  <p className="text-sm text-blue-700">
                    Set your office location and radius to validate employee check-ins.
                    Employees outside this radius will be marked as &quot;Out of Office&quot;.
                  </p>
                </div>
              </div>
            </div>

            {/* Office Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--neu-text)] mb-2">
                  Office Latitude
                </label>
                <NeuInput
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={locationSettings.officeLat}
                  onChange={(e) =>
                    setLocationSettings({ ...locationSettings, officeLat: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="e.g., 24.8607"
                />
                <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
                  Valid range: -90 to 90
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--neu-text)] mb-2">
                  Office Longitude
                </label>
                <NeuInput
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={locationSettings.officeLng}
                  onChange={(e) =>
                    setLocationSettings({ ...locationSettings, officeLng: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="e.g., 67.0011"
                />
                <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
                  Valid range: -180 to 180
                </p>
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-[var(--neu-text)] mb-2">
                Allowed Radius (meters)
              </label>
              <NeuInput
                type="number"
                min="10"
                max="5000"
                value={locationSettings.radiusMeters}
                onChange={(e) =>
                  setLocationSettings({ ...locationSettings, radiusMeters: parseInt(e.target.value) || 100 })
                }
              />
              <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
                Range: 10 to 5000 meters. Recommended: 100-200m for office buildings.
              </p>
            </div>

            {/* Geofence Mode */}
            <div className="flex items-center gap-4 p-4 bg-[var(--neu-bg)] rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[var(--neu-text)] mb-1">
                  Geofence Mode
                </label>
                <p className="text-sm text-[var(--neu-text-secondary)]">
                  {locationSettings.strictGeofence
                    ? "Strict mode requires employees to be within the radius"
                    : "Lenient mode allows check-ins from anywhere"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${!locationSettings.strictGeofence ? "font-medium" : ""}`}>
                  Lenient
                </span>
                <button
                  onClick={() =>
                    setLocationSettings({
                      ...locationSettings,
                      strictGeofence: !locationSettings.strictGeofence,
                    })
                  }
                  className={`
                    relative w-14 h-7 rounded-full transition-colors duration-200
                    ${locationSettings.strictGeofence ? "bg-green-500" : "bg-gray-300"}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200
                      ${locationSettings.strictGeofence ? "translate-x-7" : "translate-x-0"}
                    `}
                  />
                </button>
                <span className={`text-sm ${locationSettings.strictGeofence ? "font-medium text-green-600" : ""}`}>
                  Strict
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <NeuButton
                onClick={handleSaveLocationSettings}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </NeuButton>
            </div>
          </div>
        </NeuCardContent>
      </NeuCard>
    </div>
  );
}
