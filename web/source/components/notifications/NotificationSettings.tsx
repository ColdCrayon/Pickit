/**
 * web/source/components/notifications/NotificationSettings.tsx
 *
 * Comprehensive notification settings panel
 */

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Clock,
  TrendingUp,
  Star,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface NotificationPreferences {
  oddsChanges: boolean;
  gameStarts: boolean;
  arbAlerts: boolean;
  savedTicketUpdates: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  minOddsChangePercent: number;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  oddsChanges: true,
  gameStarts: true,
  arbAlerts: true,
  savedTicketUpdates: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  minOddsChangePercent: 10,
};

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { enabled, permission, requestPermission, disableNotifications } =
    useNotifications();
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences from Firestore
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (userData?.notificationPreferences) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...userData.notificationPreferences,
          });
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Save preferences to Firestore
  const savePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationPreferences: newPreferences,
      });

      setPreferences(newPreferences);
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    savePreferences(newPreferences);
  };

  const handleOddsThresholdChange = (value: number) => {
    const newPreferences = {
      ...preferences,
      minOddsChangePercent: value,
    };
    savePreferences(newPreferences);
  };

  const handleTimeChange = (
    field: "quietHoursStart" | "quietHoursEnd",
    value: string
  ) => {
    const newPreferences = {
      ...preferences,
      [field]: value,
    };
    savePreferences(newPreferences);
  };

  if (!user) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <p className="text-gray-400 text-center">
          Please sign in to manage notification settings
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-12 bg-white/10 rounded"></div>
          <div className="h-12 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Bell className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get real-time alerts for odds changes, saved tickets, and
                arbitrage opportunities
              </p>

              {/* Permission Status */}
              <div className="flex items-center gap-2 text-sm mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    enabled
                      ? "bg-green-400"
                      : permission === "denied"
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                />
                <span className="text-gray-300">
                  {enabled
                    ? "Notifications enabled"
                    : permission === "denied"
                    ? "Notifications blocked"
                    : "Notifications disabled"}
                </span>
              </div>

              {/* Enable/Disable Button */}
              {!enabled && permission !== "denied" && (
                <button
                  onClick={requestPermission}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                >
                  Enable Notifications
                </button>
              )}

              {enabled && (
                <button
                  onClick={disableNotifications}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                >
                  Disable Notifications
                </button>
              )}

              {permission === "denied" && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    Notifications are blocked in your browser. Please update
                    your browser settings to enable them.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      {enabled && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Types</h3>

          <div className="space-y-4">
            {/* Odds Changes */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="font-medium">Odds Changes</div>
                  <div className="text-sm text-gray-400">
                    Alert when watchlist item odds move significantly
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("oddsChanges")}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.oddsChanges ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.oddsChanges ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Odds Change Threshold */}
            {preferences.oddsChanges && (
              <div className="ml-8 p-4 bg-white/5 rounded-lg">
                <label className="block text-sm font-medium mb-2">
                  Minimum Odds Change: {preferences.minOddsChangePercent}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={preferences.minOddsChangePercent}
                  onChange={(e) =>
                    handleOddsThresholdChange(Number(e.target.value))
                  }
                  disabled={saving}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5%</span>
                  <span>25%</span>
                </div>
              </div>
            )}

            {/* Game Starts */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium">Game Starts</div>
                  <div className="text-sm text-gray-400">
                    Notify 1 hour before watchlist games start
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("gameStarts")}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.gameStarts ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.gameStarts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Arbitrage Alerts */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium">Arbitrage Opportunities</div>
                  <div className="text-sm text-gray-400">
                    Alert for new high-value arbitrage opportunities
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("arbAlerts")}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.arbAlerts ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.arbAlerts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Saved Ticket Updates */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="font-medium">Saved Ticket Updates</div>
                  <div className="text-sm text-gray-400">
                    Notify when saved tickets settle or update
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("savedTicketUpdates")}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.savedTicketUpdates ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.savedTicketUpdates
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Hours */}
      {enabled && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BellOff className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold">Quiet Hours</h3>
                <p className="text-sm text-gray-400">
                  Pause notifications during specific hours
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("quietHoursEnabled")}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                preferences.quietHoursEnabled ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  preferences.quietHoursEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) =>
                    handleTimeChange("quietHoursStart", e.target.value)
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) =>
                    handleTimeChange("quietHoursEnd", e.target.value)
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {saving && (
        <div className="text-center text-sm text-gray-400">
          Saving preferences...
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
