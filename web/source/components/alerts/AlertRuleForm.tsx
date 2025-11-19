/**
 * web/source/components/alerts/AlertRuleForm.tsx
 * Form component for creating and editing alert rules
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAlertRules } from "../../hooks/useAlertRules";
import { AlertRule, CreateAlertRuleInput, AlertCondition } from "../../types/alerts";
import { X, Save } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">
            {existingRule ? "Edit Alert Rule" : "Create Alert Rule"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Alert Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., High Value NBA Arbs"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what this alert monitors..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Condition Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Alert Condition <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.condition}
              onChange={(e) => handleChange("condition", e.target.value as AlertCondition)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="line_movement">Line Movement</option>
              <option value="price_threshold">Price Threshold</option>
              <option value="arb_opportunity">Arbitrage Opportunity</option>
              <option value="market_suspension">Market Suspension</option>
              <option value="game_start">Game Start Reminder</option>
            </select>
          </div>

          {/* League Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              League (Optional)
            </label>
            <select
              value={formData.league || ""}
              onChange={(e) => handleChange("league", e.target.value || undefined)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
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

          {/* Market Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Market Type (Optional)
            </label>
            <select
              value={formData.marketType || ""}
              onChange={(e) => handleChange("marketType", e.target.value || undefined)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">All Markets</option>
              <option value="moneyline">Moneyline</option>
              <option value="spread">Spread</option>
              <option value="totals">Totals</option>
            </select>
          </div>

          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Specific Team (Optional)
            </label>
            <input
              type="text"
              value={formData.teamName || ""}
              onChange={(e) => handleChange("teamName", e.target.value || undefined)}
              placeholder="e.g., Los Angeles Lakers"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Threshold Value (for line_movement and price_threshold) */}
          {(formData.condition === "line_movement" || formData.condition === "price_threshold") && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Threshold Value (%)
              </label>
              <input
                type="number"
                value={formData.thresholdValue}
                onChange={(e) => handleChange("thresholdValue", Number(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Alert when odds change by at least this percentage
              </p>
            </div>
          )}

          {/* Arb Margin (for arb_opportunity) */}
          {formData.condition === "arb_opportunity" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Arbitrage Margin (%)
              </label>
              <input
                type="number"
                value={formData.arbMinMargin}
                onChange={(e) => handleChange("arbMinMargin", Number(e.target.value))}
                min="0.1"
                max="50"
                step="0.1"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Alert when arbitrage margin exceeds this value
              </p>
            </div>
          )}

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <div className="font-medium">Enable Immediately</div>
              <div className="text-sm text-gray-400">
                Start monitoring this rule right away
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChange("enabled", !formData.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.enabled ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  formData.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : existingRule ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertRuleForm;