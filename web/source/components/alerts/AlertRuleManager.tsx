/**
 * web/source/components/alerts/AlertRuleManager.tsx
 * Main UI for managing custom alert rules
 */

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAlertRules } from "../../hooks/useAlertRules";
import { AlertRule } from "../../types/alerts";
import { Plus, Edit2, Trash2, Bell, BellOff, Clock } from "lucide-react";
import AlertRuleForm from "./AlertRuleForm";
import AlertSnoozeControls from "./AlertSnoozeControls";

const AlertRuleManager: React.FC = () => {
  const { user } = useAuth();
  const { rules, loading, toggleRule, deleteRule, snoozeRule, muteRule } = useAlertRules(user?.uid);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [snoozing, setSnoozing] = useState<string | null>(null);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading alert rules...</div>;
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
        <h3 className="text-xl font-bold">Custom Alert Rules</h3>
        <button
          onClick={() => { setEditingRule(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No custom alert rules yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            Create Your First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {rule.enabled ? (
                      <Bell className="w-5 h-5 text-green-400" />
                    ) : (
                      <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                    <h4 className="font-semibold">{rule.name}</h4>
                    {rule.muted && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Muted</span>
                    )}
                    {rule.snoozedUntil && new Date(rule.snoozedUntil.toDate()) > new Date() && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Snoozed
                      </span>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-sm text-gray-400 mb-2">{rule.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-white/5 rounded">{rule.condition}</span>
                    {rule.league && <span className="px-2 py-1 bg-white/5 rounded">{rule.league}</span>}
                    {rule.thresholdValue && <span className="px-2 py-1 bg-white/5 rounded">Threshold: {rule.thresholdValue}%</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id, !rule.enabled)}
                    className={`p-2 rounded-lg transition ${rule.enabled ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-gray-500/20 hover:bg-gray-500/30'}`}
                    title={rule.enabled ? "Disable" : "Enable"}
                  >
                    {rule.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleSnooze(rule.id)}
                    className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition"
                    title="Snooze"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
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