import React from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useSettings } from "../../hooks/useSettings";
import { useProEntitlement } from "@/hooks/useProEntitlement";
import { openProPurchasePage } from "@/utils/commerce";
import { Button } from "../ui/Button";

interface UpdateChecksToggleProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const UpdateChecksToggle: React.FC<UpdateChecksToggleProps> = ({
  descriptionMode = "tooltip",
  grouped = false,
}) => {
  const { t } = useTranslation();
  const { getSetting, updateSetting, isUpdating } = useSettings();
  const { entitlement } = useProEntitlement();
  const updateChecksEnabled = getSetting("update_checks_enabled") ?? true;
  const proActive = entitlement?.active ?? false;

  return (
    <div className="space-y-2">
      <ToggleSwitch
        checked={updateChecksEnabled && proActive}
        onChange={(enabled) => updateSetting("update_checks_enabled", enabled)}
        isUpdating={isUpdating("update_checks_enabled")}
        label={t("settings.debug.updateChecks.label")}
        description={
          proActive
            ? t("settings.debug.updateChecks.description")
            : t("settings.debug.updateChecks.proRequired")
        }
        descriptionMode={descriptionMode}
        grouped={grouped}
        disabled={!proActive}
      />
      {!proActive && (
        <div className="px-3">
          <Button variant="secondary" size="sm" onClick={openProPurchasePage}>
            {t("settings.debug.updateChecks.upgrade")}
          </Button>
        </div>
      )}
    </div>
  );
};
