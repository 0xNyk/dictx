import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type } from "@tauri-apps/plugin-os";
import {
  checkAccessibilityPermission,
  requestAccessibilityPermission,
} from "tauri-plugin-macos-permissions-api";
import { commands } from "@/bindings";

// Define permission state type
type PermissionState = "request" | "verify" | "granted";

// Define button configuration type
interface ButtonConfig {
  text: string;
  className: string;
}

const AccessibilityPermissions: React.FC = () => {
  const { t } = useTranslation();
  const [hasAccessibility, setHasAccessibility] = useState<boolean>(false);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("request");

  // Accessibility permissions are only required on macOS
  const isMacOS = type() === "macos";

  // Check permissions without requesting
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    const initializeAfterGrant = async () => {
      try {
        await Promise.all([
          commands.initializeEnigo(),
          commands.initializeShortcuts(),
        ]);
      } catch (error) {
        console.warn(
          "Failed to initialize after accessibility permission grant:",
          error,
        );
      }
    };

    try {
      const hasPermissions: boolean = await checkAccessibilityPermission();
      setHasAccessibility((prev) => {
        if (!prev && hasPermissions) {
          void initializeAfterGrant();
        }
        return hasPermissions;
      });
      setPermissionState(hasPermissions ? "granted" : "verify");
      return hasPermissions;
    } catch (error) {
      console.error("Error checking accessibility permissions:", error);
      setPermissionState("verify");
      return false;
    }
  }, []);

  // Handle the unified button action based on current state
  const handleButtonClick = async (): Promise<void> => {
    if (permissionState === "request") {
      try {
        await requestAccessibilityPermission();
        // After system prompt, transition to verification state
        setPermissionState("verify");
      } catch (error) {
        console.error("Error requesting permissions:", error);
        setPermissionState("verify");
      }
    } else if (permissionState === "verify") {
      // State is "verify" - check if permission was granted
      await checkPermissions();
    }
  };

  // On app boot - check permissions (only on macOS)
  useEffect(() => {
    if (!isMacOS) return;

    const initialSetup = async (): Promise<void> => {
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) {
        setPermissionState("request");
      }
    };

    const handleFocus = () => {
      void checkPermissions();
    };

    initialSetup();

    const interval = window.setInterval(() => {
      void checkPermissions();
    }, 1500);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [checkPermissions, hasAccessibility, isMacOS]);

  // Skip rendering on non-macOS platforms
  if (!isMacOS) {
    return null;
  }

  // Configure button text and style based on state
  const buttonConfig: Record<PermissionState, ButtonConfig | null> = {
    request: {
      text: t("accessibility.openSettings"),
      className:
        "px-2 py-1 text-sm font-semibold bg-mid-gray/10 border  border-mid-gray/80 hover:bg-logo-primary/10 rounded cursor-pointer hover:border-logo-primary",
    },
    verify: {
      text: t("accessibility.openSettings"),
      className:
        "bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-md text-sm flex items-center justify-center cursor-pointer",
    },
    granted: null,
  };

  const config = buttonConfig[permissionState];
  const statusClassName = hasAccessibility
    ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
    : "bg-amber-400/20 text-amber-200 border-amber-400/30";
  const statusText = hasAccessibility ? t("common.enabled") : t("common.disabled");

  return (
    <div className="p-4 w-full rounded-lg border border-mid-gray">
      <div className="flex justify-between items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {t("accessibility.permissionsDescription")}
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClassName}`}
            >
              {statusText}
            </span>
          </div>
        </div>
        {!hasAccessibility && config && (
          <button
            onClick={handleButtonClick}
            className={`min-h-10 shrink-0 ${config.className}`}
          >
            {config.text}
          </button>
        )}
      </div>
    </div>
  );
};

export default AccessibilityPermissions;
