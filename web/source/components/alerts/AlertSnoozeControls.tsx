import React from "react";
import { X, Clock, Loader2 } from "lucide-react";
import { SNOOZE_DURATIONS } from "../../types/alerts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md border-white/10 bg-black/80 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-yellow-500/10">
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <CardTitle className="text-xl">Snooze Alert</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={snoozing}
                        className="h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-6 text-sm">
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
                                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 rounded-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold mb-1 text-foreground group-hover:text-yellow-500 transition-colors">{option.label}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {option.description}
                                        </div>
                                    </div>
                                    <Clock className="w-4 h-4 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs text-blue-300 flex gap-2">
                            <span>💡</span>
                            <span>
                                <strong>Tip:</strong> Snoozed alerts can be manually resumed
                                anytime from the alert rules list.
                            </span>
                        </p>
                    </div>

                    {/* Cancel Button */}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={snoozing}
                        className="w-full mt-4"
                    >
                        Cancel
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlertSnoozeControls;