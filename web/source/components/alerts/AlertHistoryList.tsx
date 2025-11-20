import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAlertHistory } from "../../hooks/useAlertHistory";
import { AlertHistoryEntry, AlertCondition } from "../../types/alerts";
import { Bell, CheckCircle, Filter, TrendingUp, DollarSign, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { formatRelativeDate } from "../../lib/utils";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const AlertHistoryList: React.FC = () => {
    const { user } = useAuth();
    const { history, loading, unreadCount, markAsRead, markAllAsRead } = useAlertHistory(user?.uid, 100);
    const [filter, setFilter] = useState<AlertCondition | "all">("all");
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                return <Bell className="w-5 h-5 text-muted-foreground" />;
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
                    <h3 className="text-xl font-bold tracking-tight">Alert History</h3>
                    {unreadCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={markAllAsRead}
                        variant="outline"
                        className="gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Mark All Read
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filter:</span>
                        </div>

                        {/* Alert Type Filter */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as AlertCondition | "all")}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        >
                            <option value="all">All Types</option>
                            <option value="line_movement">Line Movement</option>
                            <option value="price_threshold">Price Threshold</option>
                            <option value="arb_opportunity">Arbitrage</option>
                            <option value="game_start">Game Start</option>
                            <option value="market_suspension">Market Suspension</option>
                        </select>

                        {/* Unread Filter */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={showUnreadOnly}
                                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Unread only</span>
                        </label>

                        {/* Results Count */}
                        <span className="text-sm text-muted-foreground ml-auto">
                            {filteredHistory.length} result{filteredHistory.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            {filteredHistory.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-secondary/50 mb-4">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-2">No alerts to display</p>
                        <p className="text-sm text-muted-foreground/60">
                            {showUnreadOnly
                                ? "All alerts have been read"
                                : filter !== "all"
                                    ? "No alerts match the selected filter"
                                    : "Your alert history will appear here"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredHistory.map((entry) => (
                        <div
                            key={entry.id}
                            onClick={() => !entry.read && markAsRead(entry.id)}
                            className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer ${entry.read
                                    ? "bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10"
                                    : "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="mt-1 p-2 rounded-full bg-white/5">
                                    {getAlertIcon(entry.alertType)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-semibold ${!entry.read ? "text-white" : "text-muted-foreground"}`}>
                                                    {entry.ruleName}
                                                </h4>
                                                {!entry.read && (
                                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                                {formatAlertType(entry.alertType)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                                            {formatRelativeDate(entry.createdAt.toDate())}
                                        </span>
                                    </div>

                                    {/* Message */}
                                    <p className={`text-sm mb-2 ${!entry.read ? "text-gray-200" : "text-muted-foreground"}`}>
                                        {entry.message}
                                    </p>

                                    {/* Teams (if available) */}
                                    {entry.teams && (
                                        <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                            <span>{entry.teams.home} vs {entry.teams.away}</span>
                                            {entry.league && (
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                                    {entry.league}
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {/* Details */}
                                    {entry.details && Object.keys(entry.details).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {entry.details.oldValue !== undefined && entry.details.newValue !== undefined && (
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                    {entry.details.oldValue} → {entry.details.newValue}
                                                </Badge>
                                            )}
                                            {entry.details.threshold !== undefined && (
                                                <Badge variant="outline" className="text-xs">
                                                    Threshold: {entry.details.threshold}%
                                                </Badge>
                                            )}
                                            {entry.details.arbMargin !== undefined && (
                                                <Badge variant="success" className="text-xs">
                                                    Margin: {entry.details.arbMargin.toFixed(2)}%
                                                </Badge>
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
                <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing last 100 alerts. Older alerts are archived.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AlertHistoryList;