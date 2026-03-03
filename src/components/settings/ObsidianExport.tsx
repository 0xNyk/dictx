import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { SettingContainer } from "../ui/SettingContainer";
import { useSettings } from "../../hooks/useSettings";
import { open } from "@tauri-apps/plugin-dialog";

interface ObsidianExportProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const ObsidianExportToggle: React.FC<ObsidianExportProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();

    const enabled = getSetting("obsidian_export_enabled") ?? false;

    return (
      <ToggleSwitch
        checked={enabled}
        onChange={(val) => updateSetting("obsidian_export_enabled", val)}
        isUpdating={isUpdating("obsidian_export_enabled")}
        label={t("settings.obsidian.exportToggle.label")}
        description={t("settings.obsidian.exportToggle.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
        tooltipPosition="bottom"
      />
    );
  },
);

export const ObsidianVaultPath: React.FC<ObsidianExportProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting } = useSettings();
    const vaultPath = (getSetting("obsidian_vault_path") as string) ?? "";

    const handleBrowse = async () => {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("settings.obsidian.vaultPath.dialogTitle"),
      });
      if (selected && typeof selected === "string") {
        updateSetting("obsidian_vault_path", selected);
      }
    };

    return (
      <SettingContainer
        title={t("settings.obsidian.vaultPath.title")}
        description={t("settings.obsidian.vaultPath.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-mid-gray truncate max-w-[200px]">
            {vaultPath || t("settings.obsidian.vaultPath.notSet")}
          </span>
          <button
            onClick={handleBrowse}
            className="px-3 py-1 text-xs bg-background-ui text-white rounded hover:opacity-80 transition-opacity"
          >
            {t("settings.obsidian.vaultPath.browse")}
          </button>
        </div>
      </SettingContainer>
    );
  },
);

export const ObsidianSubfolder: React.FC<ObsidianExportProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting } = useSettings();
    const subfolder =
      (getSetting("obsidian_export_subfolder") as string) ?? "voice-notes";
    const [localValue, setLocalValue] = useState(subfolder);

    const handleBlur = () => {
      if (localValue !== subfolder) {
        updateSetting("obsidian_export_subfolder", localValue || "voice-notes");
      }
    };

    return (
      <SettingContainer
        title={t("settings.obsidian.subfolder.title")}
        description={t("settings.obsidian.subfolder.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
      >
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          placeholder="voice-notes"
          className="w-[160px] px-2 py-1 text-xs bg-transparent border border-mid-gray/30 rounded text-white focus:border-logo-primary focus:outline-none"
        />
      </SettingContainer>
    );
  },
);

export const ObsidianAppendToDaily: React.FC<ObsidianExportProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();

    const enabled = getSetting("obsidian_append_to_daily") ?? false;

    return (
      <ToggleSwitch
        checked={enabled}
        onChange={(val) => updateSetting("obsidian_append_to_daily", val)}
        isUpdating={isUpdating("obsidian_append_to_daily")}
        label={t("settings.obsidian.appendToDaily.label")}
        description={t("settings.obsidian.appendToDaily.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
        tooltipPosition="bottom"
      />
    );
  },
);
