"use client";

import { useState } from "react";
import { useViewer } from "@/lib/hooks/useViewer";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Pencil, Check, X } from "lucide-react";

type EditingField = "firstName" | "lastName" | "username" | null;

export default function SettingsPage() {
  const { viewer, setViewer } = useViewer();
  const trpc = useTRPC();

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    ...trpc.user.updateProfile.mutationOptions(),
    onSuccess: (updatedUser) => {
      setViewer(updatedUser);
      setEditingField(null);
      setEditValue("");
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const startEditing = (field: EditingField) => {
    if (!field) return;
    setEditingField(field);
    setEditValue(viewer[field]);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
    setError(null);
  };

  const saveField = () => {
    if (!editingField || editValue === viewer[editingField]) {
      cancelEditing();
      return;
    }
    updateMutation.mutate({ [editingField]: editValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveField();
    if (e.key === "Escape") cancelEditing();
  };

  const fields = [
    { key: "firstName" as const, label: "First name" },
    { key: "lastName" as const, label: "Last name" },
    { key: "username" as const, label: "Username", prefix: "@" },
  ];

  return (
    <div className="flex flex-1 flex-col p-8 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Profile section */}
      <section className="space-y-1 mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Profile
        </h2>

        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between py-3 border-b border-border group"
          >
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
              {editingField === field.key ? (
                <div className="flex items-center gap-2">
                  {field.prefix && (
                    <span className="text-muted-foreground text-sm">{field.prefix}</span>
                  )}
                  <input
                    className="bg-muted rounded-md px-2 py-1 text-sm flex-1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <button
                    className="p-1 rounded-md hover:bg-primary/20 text-primary transition-colors"
                    onClick={saveField}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                    onClick={cancelEditing}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium">
                  {field.prefix && <span className="text-muted-foreground">{field.prefix}</span>}
                  {viewer[field.key]}
                </p>
              )}
            </div>
            {editingField !== field.key && (
              <button
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                onClick={() => startEditing(field.key)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-500 pt-2">{error}</p>
        )}
      </section>
    </div>
  );
}
