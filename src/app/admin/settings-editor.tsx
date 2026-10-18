"use client";

import { settingsGroups } from "@/lib/collections";
import type { Settings } from "@/lib/types";
import { FieldInput } from "./fields";

// Company details, banner text, about text ... (everything in settingsGroups, see collections.ts)
export function SettingsEditor({ settings, onChange, onError }: { settings: Settings; onChange: (settings: Settings) => void; onError: (message: string) => void }) {
  return (
    <>
      {settingsGroups.map((group) => (
        <div className="admin-card" key={group.title}>
          <h2>{group.title}</h2>
          {group.help && <p className="admin-muted">{group.help}</p>}
          <div className="admin-fields">
            {group.fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={settings[field.key]}
                onChange={(value) => onChange({ ...settings, [field.key]: value as string })}
                onError={onError}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
