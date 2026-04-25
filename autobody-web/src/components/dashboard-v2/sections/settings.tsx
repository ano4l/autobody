"use client";

import { User, Building2, Shield, Bell } from "lucide-react";

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Profile</h3>
                <p className="text-sm text-muted-foreground">Your personal information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" defaultValue="Jan Ferreira" />
              <Field label="Email" defaultValue="jan@ferreiras.local" type="email" />
              <Field label="Role" defaultValue="Administrator" readOnly />
              <Field label="Branch" defaultValue="All Branches" readOnly />
            </div>

            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Branch Operations</h3>
                <p className="text-sm text-muted-foreground">Stock thresholds and operational rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Low Stock Threshold" defaultValue="5" />
              <Field label="Order Hold Period (hours)" defaultValue="24" />
              <Field label="Delivery Radius (km)" defaultValue="50" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-3">
              {["New orders", "Conversation alerts", "Status changes", "Stock warnings"].map(
                (item) => (
                  <label key={item} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-foreground">{item}</span>
                    <div className="w-10 h-6 rounded-full bg-accent/80 flex items-center px-0.5 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-accent-foreground translate-x-4 transition-transform" />
                    </div>
                  </label>
                ),
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Branches</h3>
            </div>
            <div className="space-y-2">
              {["Pretoria (ZAR)", "Johannesburg (ZAR)", "Cape Town (ZAR)", "Durban (ZAR)"].map(
                (branch) => (
                  <div
                    key={branch}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-sm text-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {branch}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  readOnly,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={
          readOnly
            ? "w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground cursor-not-allowed"
            : "w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent"
        }
      />
    </div>
  );
}
