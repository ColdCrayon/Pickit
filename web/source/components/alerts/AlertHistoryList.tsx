/**
 * web/source/components/alerts/AlertHistoryList.tsx
 * Component for viewing alert notification history
 */

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAlertHistory } from "../../hooks/useAlertHistory";
import { AlertHistoryEntry, AlertCondition } from "../../types/alerts";
import { Bell, CheckCircle, Filter, TrendingUp, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { formatRelativeDate } from "../../lib/utils";

const AlertHistoryList: React.FC = () => {
  const { user } = useAuth();
  const { history, loading, unreadCount, markAsRead, markAllAsRead } = useAlertHistory(user?.uid, 100);
  const [filter, setFilter] = useState<AlertCondition | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        Loading alert history...
      </div>
    );
  }

  const filteredHistory = history.filter(entry => {
    if (showUnreadOnly && entry.read) return false;
    if (filter !== "all" && entry.alertType !== filter) return false;
    return true;
  });

  const getAlertIcon = (alertType: AlertCondition) => {
    switch (alertType) {
      case "line_movement":
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case "arb_opportunity":
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case "game_start":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "market_suspension":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "price_threshold":
        return <Bell className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatAlertType = (type: AlertCondition) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Alert History</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
          >
            <CheckCircle className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          {/* Alert Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AlertCondition | "all")}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="line_movement">Line Movement</option>
            <option value="price_threshold">Price Threshold</option>
            <option value="arb_opportunity">Arbitrage</option>
            <option value="game_start">Game Start</option>
            <option value="market_suspension">Market Suspension</option>
          </select>

          {/* Unread Filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm">Unread only</span>
          </label>

          {/* Results Count */}
          <span className="text-sm text-gray-400 ml-auto">
            {filteredHistory.length} result{filteredHistory.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No alerts to display</p>
          <p className="text-sm text-gray-500">
            {showUnreadOnly
              ? "All alerts have been read"
              : filter !== "all"
              ? "No alerts match the selected filter"
              : "Your alert history will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((entry) => (
            <div
              key={entry.id}
              onClick={() => !entry.read && markAsRead(entry.id)}
              className={`bg-white/5 border rounded-xl p-4 transition cursor-pointer ${
                entry.read
                  ? "border-white/10 hover:bg-white/[0.07]"
                  : "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-1">
                  {getAlertIcon(entry.alertType)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{entry.ruleName}</h4>
                        {!entry.read && (
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {formatAlertType(entry.alertType)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeDate(entry.createdAt.toDate())}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-300 mb-2">{entry.message}</p>

                  {/* Teams (if available) */}
                  {entry.teams && (
                    <div className="text-sm text-gray-400 mb-2">
                      {entry.teams.home} vs {entry.teams.away}
                      {entry.league && (
                        <span className="ml-2 px-2 py-0.5 bg-white/5 rounded text-xs">
                          {entry.league}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Details */}
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.details.oldValue !== undefined && entry.details.newValue !== undefined && (
                        <span className="px-2 py-1 bg-white/5 rounded text-xs">
                          {entry.details.oldValue} → {entry.details.newValue}
                        </span>
                      )}
                      {entry.details.threshold !== undefined && (
                        <span className="px-2 py-1 bg-white/5 rounded text-xs">
                          Threshold: {entry.details.threshold}%
                        </span>
                      )}
                      {entry.details.arbMargin !== undefined && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Margin: {entry.details.arbMargin.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredHistory.length >= 100 && (
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Showing last 100 alerts. Older alerts are archived.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertHistoryList;