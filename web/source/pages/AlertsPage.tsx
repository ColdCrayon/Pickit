import React from "react";
import AlertRuleManager from "../components/alerts/AlertRuleManager";
import AlertHistoryList from "../components/alerts/AlertHistoryList";
import { Bell, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";

const AlertsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

            <main className="relative z-10 max-w-6xl mx-auto py-12 px-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-primary" />
                        Alerts & Notifications
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your custom alert rules and view notification history
                    </p>
                </div>

                <Tabs defaultValue="rules" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                        <TabsTrigger value="rules">Alert Rules</TabsTrigger>
                        <TabsTrigger value="history">Alert History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="rules">
                        <AlertRuleManager />
                    </TabsContent>

                    <TabsContent value="history">
                        <AlertHistoryList />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default AlertsPage;
