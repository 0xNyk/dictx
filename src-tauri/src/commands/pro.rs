use crate::settings::{self, ProEntitlement};
use chrono::Utc;
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

const DEFAULT_PRO_VERIFY_URL: &str = "https://dictx.splitlabs.io/api/pro/verify";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct VerifyRequest {
    license_key: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyResponse {
    active: bool,
}

fn get_verify_url() -> String {
    std::env::var("DICTX_PRO_VERIFY_URL").unwrap_or_else(|_| DEFAULT_PRO_VERIFY_URL.to_string())
}

async fn verify_checkout(license_key: &str) -> Result<bool, String> {
    let payload = VerifyRequest {
        license_key: license_key.trim().to_string(),
    };

    if payload.license_key.is_empty() {
        return Err("License key is required".to_string());
    }

    let client = reqwest::Client::new();
    let response = client
        .post(get_verify_url())
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Verification request failed: {}", e))?;

    if response.status() == StatusCode::OK {
        let body: VerifyResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse verification response: {}", e))?;
        Ok(body.active)
    } else if response.status() == StatusCode::UNAUTHORIZED
        || response.status() == StatusCode::NOT_FOUND
    {
        Ok(false)
    } else {
        let status = response.status();
        let text = response
            .text()
            .await
            .unwrap_or_else(|_| "unknown error".to_string());
        Err(format!("Verification API error ({}): {}", status, text))
    }
}

#[tauri::command]
#[specta::specta]
pub fn get_pro_entitlement(app: AppHandle) -> Result<ProEntitlement, String> {
    let settings = settings::get_settings(&app);
    Ok(settings.pro_entitlement)
}

#[tauri::command]
#[specta::specta]
pub fn clear_pro_entitlement(app: AppHandle) -> Result<ProEntitlement, String> {
    let mut app_settings = settings::get_settings(&app);
    app_settings.pro_entitlement = ProEntitlement::default();
    app_settings.update_checks_enabled = false;
    settings::write_settings(&app, app_settings.clone());
    crate::tray::update_tray_menu(&app, &crate::tray::TrayIconState::Idle, None);
    Ok(app_settings.pro_entitlement)
}

#[tauri::command]
#[specta::specta]
pub async fn activate_pro_entitlement(
    app: AppHandle,
    license_key: String,
) -> Result<ProEntitlement, String> {
    let active = verify_checkout(&license_key).await?;
    if !active {
        return Err("No active Dictx Pro entitlement found for this license key".to_string());
    }

    let now = Utc::now().timestamp();
    let mut app_settings = settings::get_settings(&app);
    app_settings.pro_entitlement = ProEntitlement {
        active: true,
        license_key: Some(license_key.trim().to_string()),
        email: None,
        checkout_id: None,
        activated_at: Some(now),
        last_verified_at: Some(now),
        verification_error: None,
    };
    app_settings.update_checks_enabled = true;
    settings::write_settings(&app, app_settings.clone());
    crate::tray::update_tray_menu(&app, &crate::tray::TrayIconState::Idle, None);

    Ok(app_settings.pro_entitlement)
}

#[tauri::command]
#[specta::specta]
pub async fn refresh_pro_entitlement(app: AppHandle) -> Result<ProEntitlement, String> {
    let mut app_settings = settings::get_settings(&app);

    // Support legacy activations by falling back to checkout_id if license_key is missing.
    let license_key = match app_settings
        .pro_entitlement
        .license_key
        .clone()
        .or_else(|| app_settings.pro_entitlement.checkout_id.clone())
    {
        Some(value) if !value.trim().is_empty() => value,
        _ => return Ok(app_settings.pro_entitlement),
    };

    let now = Utc::now().timestamp();
    match verify_checkout(&license_key).await {
        Ok(true) => {
            app_settings.pro_entitlement.active = true;
            app_settings.pro_entitlement.license_key = Some(license_key);
            app_settings.pro_entitlement.last_verified_at = Some(now);
            app_settings.pro_entitlement.verification_error = None;
        }
        Ok(false) => {
            app_settings.pro_entitlement.active = false;
            app_settings.pro_entitlement.last_verified_at = Some(now);
            app_settings.pro_entitlement.verification_error =
                Some("Entitlement no longer active".to_string());
            app_settings.update_checks_enabled = false;
        }
        Err(err) => {
            app_settings.pro_entitlement.verification_error = Some(err.clone());
            settings::write_settings(&app, app_settings.clone());
            return Err(err);
        }
    }

    settings::write_settings(&app, app_settings.clone());
    crate::tray::update_tray_menu(&app, &crate::tray::TrayIconState::Idle, None);
    Ok(app_settings.pro_entitlement)
}
