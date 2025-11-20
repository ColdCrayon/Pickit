import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAlertRules } from "../../hooks/useAlertRules";
import { AlertRule } from "../../types/alerts";
import { Plus, Edit2, Trash2, Bell, BellOff, Clock, Loader2 } from "lucide-react";
import AlertRuleForm from "./AlertRuleForm";
import AlertSnoozeControls from "./AlertSnoozeControls";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const AlertRuleManager: React.FC = () => {
    const { user } = useAuth();
    const { rules, loading, toggleRule, deleteRule, snoozeRule } = useAlertRules(user?.uid);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
    const [snoozing, setSnoozing] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleEdit = (rule: AlertRule) => {
        setEditingRule(rule);
        setShowForm(true);
    };

    const handleDelete = async (ruleId: string) => {
        if (confirm("Delete this alert rule?")) {
            await deleteRule(ruleId);
        }
    };

    const handleSnooze = (ruleId: string) => {
        setSnoozing(ruleId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Custom Alert Rules</h3>
                <Button
                    onClick={() => { setEditingRule(null); setShowForm(true); }}
                    className="gap-2"
                    variant="liquid"
                >
                    <Plus className="w-4 h-4" />
                    Create Rule
                </Button>
            </div>

            {/* Rules List */}
            {rules.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-secondary/50 mb-4">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">No alert rules yet</h4>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Create custom rules to get notified about line movements, arbitrage opportunities, and more.
                        </p>
                        <Button onClick={() => setShowForm(true)} variant="outline">
                            Create Your First Rule
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {rules.map(rule => (
                        <Card key={rule.id} className="overflow-hidden transition-all hover:border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {rule.enabled ? (
                                                <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                                    <Bell className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-full bg-muted text-muted-foreground">
                                                    <BellOff className="w-4 h-4" />
                                                </div>
                                            )}
                                            <h4 className="font-semibold text-lg">{rule.name}</h4>
                                            {rule.muted && (
                                                <Badge variant="destructive" className="text-xs">Muted</Badge>
                                            )}
                                            {rule.snoozedUntil && new Date(rule.snoozedUntil.toDate()) > new Date() && (
                                                <Badge variant="warning" className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Snoozed
                                                </Badge>
                                            )}
                                        </div>

                                        {rule.description && (
                                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                                        )}

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <Badge variant="secondary" className="font-normal">
                                                {rule.condition.replace('_', ' ')}
                                            </Badge>
                                            {rule.league && (
                                                <Badge variant="outline" className="font-normal">
                                                    {rule.league}
                                                </Badge>
                                            )}
                                            {rule.thresholdValue && (
                                                <Badge variant="outline" className="font-normal">
                                                    Threshold: {rule.thresholdValue}%
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleRule(rule.id, !rule.enabled)}
                                            title={rule.enabled ? "Disable" : "Enable"}
                                            className={rule.enabled ? "text-green-500 hover:text-green-600 hover:bg-green-500/10" : "text-muted-foreground"}
                                        >
                                            {rule.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleSnooze(rule.id)}
                                            title="Snooze"
                                            className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                                        >
                                            <Clock className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(rule)}
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(rule.id)}
                                            title="Delete"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showForm && (
                <AlertRuleForm
                    existingRule={editingRule}
                    onClose={() => { setShowForm(false); setEditingRule(null); }}
                />
            )}

            {snoozing && (
                <AlertSnoozeControls
                    ruleId={snoozing}
                    onClose={() => setSnoozing(null)}
                    onSnooze={async (hours) => {
                        await snoozeRule(snoozing, hours);
                        setSnoozing(null);
                    }}
                />
            )}
        </div>
    );
};

export default AlertRuleManager;