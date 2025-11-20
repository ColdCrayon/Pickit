import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAlertRules } from "../../hooks/useAlertRules";
import { AlertRule, CreateAlertRuleInput, AlertCondition } from "../../types/alerts";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

interface AlertRuleFormProps {
    existingRule?: AlertRule | null;
    onClose: () => void;
}

const AlertRuleForm: React.FC<AlertRuleFormProps> = ({ existingRule, onClose }) => {
    const { user } = useAuth();
    const { createRule, updateRule } = useAlertRules(user?.uid);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateAlertRuleInput>({
        name: "",
        description: "",
        enabled: true,
        condition: "line_movement",
        league: undefined,
        eventId: undefined,
        marketType: undefined,
        teamName: undefined,
        thresholdValue: 10,
        arbMinMargin: 5,
        muted: false,
    });

    useEffect(() => {
        if (existingRule) {
            setFormData({
                name: existingRule.name,
                description: existingRule.description || "",
                enabled: existingRule.enabled,
                condition: existingRule.condition,
                league: existingRule.league,
                eventId: existingRule.eventId,
                marketType: existingRule.marketType,
                teamName: existingRule.teamName,
                thresholdValue: existingRule.thresholdValue || 10,
                arbMinMargin: existingRule.arbMinMargin || 5,
                muted: existingRule.muted,
            });
        }
    }, [existingRule]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            if (!formData.name.trim()) {
                throw new Error("Alert name is required");
            }

            if (existingRule) {
                await updateRule(existingRule.id, formData);
            } else {
                await createRule(formData);
            }

            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save alert rule");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof CreateAlertRuleInput, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-black/80 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-10 border-b border-white/5 pb-4">
                    <CardTitle className="text-xl">
                        {existingRule ? "Edit Alert Rule" : "Create Alert Rule"}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Alert Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g., High Value NBA Arbs"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Describe what this alert monitors..."
                                rows={3}
                                className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Condition Type */}
                            <div className="space-y-2">
                                <Label htmlFor="condition">Alert Condition <span className="text-destructive">*</span></Label>
                                <select
                                    id="condition"
                                    value={formData.condition}
                                    onChange={(e) => handleChange("condition", e.target.value as AlertCondition)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="line_movement">Line Movement</option>
                                    <option value="price_threshold">Price Threshold</option>
                                    <option value="arb_opportunity">Arbitrage Opportunity</option>
                                    <option value="market_suspension">Market Suspension</option>
                                    <option value="game_start">Game Start Reminder</option>
                                </select>
                            </div>

                            {/* League Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="league">League (Optional)</Label>
                                <select
                                    id="league"
                                    value={formData.league || ""}
                                    onChange={(e) => handleChange("league", e.target.value || undefined)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">All Leagues</option>
                                    <option value="NBA">NBA</option>
                                    <option value="NFL">NFL</option>
                                    <option value="MLB">MLB</option>
                                    <option value="NHL">NHL</option>
                                    <option value="NCAAF">NCAAF</option>
                                    <option value="NCAAB">NCAAB</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Market Type */}
                            <div className="space-y-2">
                                <Label htmlFor="marketType">Market Type (Optional)</Label>
                                <select
                                    id="marketType"
                                    value={formData.marketType || ""}
                                    onChange={(e) => handleChange("marketType", e.target.value || undefined)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">All Markets</option>
                                    <option value="moneyline">Moneyline</option>
                                    <option value="spread">Spread</option>
                                    <option value="totals">Totals</option>
                                </select>
                            </div>

                            {/* Team Name */}
                            <div className="space-y-2">
                                <Label htmlFor="teamName">Specific Team (Optional)</Label>
                                <Input
                                    id="teamName"
                                    value={formData.teamName || ""}
                                    onChange={(e) => handleChange("teamName", e.target.value || undefined)}
                                    placeholder="e.g., Los Angeles Lakers"
                                />
                            </div>
                        </div>

                        {/* Threshold Value (for line_movement and price_threshold) */}
                        {(formData.condition === "line_movement" || formData.condition === "price_threshold") && (
                            <div className="space-y-2">
                                <Label htmlFor="thresholdValue">Threshold Value (%)</Label>
                                <Input
                                    id="thresholdValue"
                                    type="number"
                                    value={formData.thresholdValue}
                                    onChange={(e) => handleChange("thresholdValue", Number(e.target.value))}
                                    min="1"
                                    max="100"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Alert when odds change by at least this percentage
                                </p>
                            </div>
                        )}

                        {/* Arb Margin (for arb_opportunity) */}
                        {formData.condition === "arb_opportunity" && (
                            <div className="space-y-2">
                                <Label htmlFor="arbMinMargin">Minimum Arbitrage Margin (%)</Label>
                                <Input
                                    id="arbMinMargin"
                                    type="number"
                                    value={formData.arbMinMargin}
                                    onChange={(e) => handleChange("arbMinMargin", Number(e.target.value))}
                                    min="0.1"
                                    max="50"
                                    step="0.1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Alert when arbitrage margin exceeds this value
                                </p>
                            </div>
                        )}

                        {/* Enabled Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                            <div>
                                <div className="font-medium">Enable Immediately</div>
                                <div className="text-sm text-muted-foreground">
                                    Start monitoring this rule right away
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange("enabled", !formData.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${formData.enabled ? "bg-primary" : "bg-muted"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={saving}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="liquid"
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {existingRule ? "Update Rule" : "Create Rule"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlertRuleForm;