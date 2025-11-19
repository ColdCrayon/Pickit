/**
 * web/source/components/alerts/AlertSnoozeControls.tsx
 * Modal component for snoozing alert rules
 */

import React from "react";
import { X, Clock } from "lucide-react";
import { SNOOZE_DURATIONS } from "../../types/alerts";

interface AlertSnoozeControlsProps {
  ruleId: string;
  onClose: () => void;
  onSnooze: (hours: number) => Promise<void>;
}

const AlertSnoozeControls: React.FC<AlertSnoozeControlsProps> = ({
  ruleId,
  onClose,
  onSnooze,
}) => {
  const [snoozing, setSnoozing] = React.useState(false);

  const handleSnooze = async (hours: number) => {
    setSnoozing(true);
    try {
      await onSnooze(hours);
      onClose();
    } catch (error) {
      console.error("Failed to snooze alert:", error);
      alert("Failed to snooze alert. Please try again.");
    } finally {
      setSnoozing(false);
    }
  };

  const snoozeOptions = [
    {
      hours: SNOOZE_DURATIONS.ONE_HOUR,
      label: "1 Hour",
      description: "Resume in 1 hour",
    },
    {
      hours: SNOOZE_DURATIONS.SIX_HOURS,
      label: "6 Hours",
      description: "Resume in 6 hours",
    },
    {
      hours: SNOOZE_DURATIONS.TWENTY_FOUR_HOURS,
      label: "24 Hours",
      description: "Resume tomorrow",
    },
    {
      hours: SNOOZE_DURATIONS.ONE_WEEK,
      label: "1 Week",
      description: "Resume next week",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-bold">Snooze Alert</h3>
          </div>
          <button
            onClick={onClose}
            disabled={snoozing}
            className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Temporarily pause this alert for a specific duration. The alert will
            automatically resume after the selected time period.
          </p>

          {/* Snooze Options */}
          <div className="space-y-3">
            {snoozeOptions.map((option) => (
              <button
                key={option.hours}
                onClick={() => handleSnooze(option.hours)}
                disabled={snoozing}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/50 rounded-lg transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-sm text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> Snoozed alerts can be manually resumed
              anytime from the alert rules list.
            </p>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={snoozing}
            className="w-full mt-4 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertSnoozeControls;