import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { CheckCircle2, KeyRound } from "lucide-react";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { SettingContainer } from "../../ui/SettingContainer";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { openProPurchasePage } from "@/utils/commerce";
import { AppDataDirectory } from "../AppDataDirectory";
import { AppLanguageSelector } from "../AppLanguageSelector";
import { LogDirectory } from "../debug";
import { useProEntitlement } from "@/hooks/useProEntitlement";

export const AboutSettings: React.FC = () => {
  const { t } = useTranslation();
  const [version, setVersion] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const {
    entitlement,
    isSubmitting: proSubmitting,
    error: proError,
    activate,
  } = useProEntitlement();

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const appVersion = await getVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error("Failed to get app version:", error);
        setVersion("0.1.2");
      }
    };

    fetchVersion();
  }, []);

  const handleActivate = async () => {
    const ok = await activate(licenseKey);
    if (ok) {
      setLicenseKey("");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      setClipboardError(null);
      const text = await navigator.clipboard.readText();
      setLicenseKey(text.trim());
    } catch (_error) {
      setClipboardError(t("settings.about.proActivation.clipboardFailed"));
    }
  };

  const activeLicenseKey = entitlement?.license_key ?? entitlement?.checkout_id;
  const hasTypedKey = licenseKey.trim().length > 0;
  const showActivateButton = !entitlement?.active || hasTypedKey;
  const proSectionTitle = entitlement?.active
    ? "Dictx Pro"
    : t("settings.about.supportDevelopment.title");
  const proSectionDescription = entitlement?.active
    ? ""
    : t("settings.about.supportDevelopment.description");

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <SettingsGroup title={t("settings.about.title")}>
        <AppLanguageSelector descriptionMode="tooltip" grouped={true} />
        <SettingContainer
          title={t("settings.about.version.title")}
          description={t("settings.about.version.description")}
          grouped={true}
        >
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <span className="text-sm font-mono">v{version}</span>
        </SettingContainer>

        <SettingContainer
          title={proSectionTitle}
          description={proSectionDescription}
          grouped={true}
          layout="stacked"
        >
          <div className="space-y-3">
            {!entitlement?.active && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => void openProPurchasePage()}
                >
                  {t("settings.about.supportDevelopment.button")}
                </Button>
              </div>
            )}

            <div className="rounded-md border border-mid-gray/20 p-3 space-y-2">
              <div
                className={`rounded-md border p-3 ${
                  entitlement?.active
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-mid-gray/20 bg-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  {entitlement?.active ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-text/70" />
                  )}
                  <p className="text-sm font-medium text-text/90">
                    {entitlement?.active
                      ? t("settings.about.proActivation.active")
                      : t("settings.about.proActivation.inactive")}
                  </p>
                </div>
                {activeLicenseKey && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] uppercase tracking-wide text-text/50">
                      {t("settings.about.proActivation.licenseKey")}
                    </p>
                    <p className="text-xs font-mono text-text/80 break-all">
                      {activeLicenseKey}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-1 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={licenseKey}
                    onChange={(event) => setLicenseKey(event.target.value)}
                    placeholder={t(
                      "settings.about.proActivation.licenseKeyPlaceholder",
                    )}
                    disabled={proSubmitting}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handlePasteFromClipboard()}
                    disabled={proSubmitting}
                  >
                    {t("settings.about.proActivation.pasteFromClipboard")}
                  </Button>
                </div>

                {showActivateButton && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => void handleActivate()}
                    disabled={proSubmitting || !hasTypedKey}
                  >
                    {t("settings.about.proActivation.activate")}
                  </Button>
                )}
              </div>
              {clipboardError && (
                <p className="text-xs text-red-400">{clipboardError}</p>
              )}
              {proError && <p className="text-xs text-red-400">{proError}</p>}
              {entitlement?.verification_error && (
                <p className="text-xs text-red-400">
                  {entitlement.verification_error}
                </p>
              )}
            </div>
          </div>
        </SettingContainer>

        <SettingContainer
          title={t("settings.about.sourceCode.title")}
          description={t("settings.about.sourceCode.description")}
          grouped={true}
        >
          <Button
            variant="secondary"
            size="md"
            onClick={() => openUrl("https://github.com/splitlabs/dictx")}
          >
            {t("settings.about.sourceCode.button")}
          </Button>
        </SettingContainer>

        <AppDataDirectory descriptionMode="tooltip" grouped={true} />
        <LogDirectory grouped={true} />
      </SettingsGroup>

      <SettingsGroup title={t("settings.about.acknowledgments.title")}>
        <SettingContainer
          title={t("settings.about.acknowledgments.whisper.title")}
          description={t("settings.about.acknowledgments.whisper.description")}
          grouped={true}
          layout="stacked"
        >
          <div className="text-sm text-mid-gray">
            {t("settings.about.acknowledgments.whisper.details")}
          </div>
        </SettingContainer>
      </SettingsGroup>
    </div>
  );
};
