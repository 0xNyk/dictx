import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
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
  const [checkoutId, setCheckoutId] = useState("");
  const [email, setEmail] = useState("");
  const {
    entitlement,
    isLoading: proLoading,
    isSubmitting: proSubmitting,
    error: proError,
    activate,
    refresh,
    clear,
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
    const ok = await activate(checkoutId, email);
    if (ok) {
      setCheckoutId("");
    }
  };

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
          title={t("settings.about.supportDevelopment.title")}
          description={t("settings.about.supportDevelopment.description")}
          grouped={true}
          layout="stacked"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => void openProPurchasePage()}
              >
                {t("settings.about.supportDevelopment.button")}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => void refresh()}
                disabled={proLoading || proSubmitting}
              >
                {t("settings.about.proActivation.refresh")}
              </Button>
              {entitlement?.active && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => void clear()}
                  disabled={proSubmitting}
                >
                  {t("settings.about.proActivation.clear")}
                </Button>
              )}
            </div>

            <div className="rounded-md border border-mid-gray/20 p-3 space-y-2">
              <p className="text-sm text-text/80">
                {entitlement?.active
                  ? t("settings.about.proActivation.active")
                  : t("settings.about.proActivation.inactive")}
              </p>
              {entitlement?.email && (
                <p className="text-xs text-text/60">
                  {t("settings.about.proActivation.email")}: {entitlement.email}
                </p>
              )}
              {entitlement?.checkout_id && (
                <p className="text-xs text-text/60">
                  {t("settings.about.proActivation.checkoutId")}:{" "}
                  {entitlement.checkout_id}
                </p>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("settings.about.proActivation.emailPlaceholder")}
                  disabled={proSubmitting}
                />
                <Input
                  value={checkoutId}
                  onChange={(event) => setCheckoutId(event.target.value)}
                  placeholder={t(
                    "settings.about.proActivation.checkoutIdPlaceholder",
                  )}
                  disabled={proSubmitting}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => void handleActivate()}
                disabled={proSubmitting || !email.trim() || !checkoutId.trim()}
              >
                {t("settings.about.proActivation.activate")}
              </Button>
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
