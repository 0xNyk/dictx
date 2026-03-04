const POLAR_API_BASE = process.env.POLAR_API_BASE || "https://api.polar.sh/v1";
const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN || "";
const ALLOWED_PRODUCT_IDS = (process.env.POLAR_DICTX_PRODUCT_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const readBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_error) {
      return {};
    }
  }
  return req.body;
};

const statusLooksPaid = (status, paid) => {
  if (paid === true) return true;
  const value = (status || "").toLowerCase();
  return (
    value === "succeeded" ||
    value === "confirmed" ||
    value === "paid" ||
    value === "completed"
  );
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  if (!POLAR_ACCESS_TOKEN) {
    res.status(500).json({ error: "missing_polar_access_token" });
    return;
  }

  const body = readBody(req);
  const licenseKey = (body.licenseKey || body.checkoutId || "").trim();

  if (!licenseKey) {
    res.status(400).json({ error: "licenseKey_required" });
    return;
  }

  try {
    const response = await fetch(
      `${POLAR_API_BASE}/checkouts/${encodeURIComponent(licenseKey)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 404) {
      res.status(404).json({ active: false });
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      res.status(502).json({ error: "polar_api_error", detail: text });
      return;
    }

    const checkout = await response.json();
    const productId =
      checkout.product_id == null ? "" : String(checkout.product_id);
    const productAllowed =
      ALLOWED_PRODUCT_IDS.length === 0 || ALLOWED_PRODUCT_IDS.includes(productId);
    const paid = statusLooksPaid(checkout.status, checkout.paid);

    res.status(200).json({ active: Boolean(productAllowed && paid) });
  } catch (error) {
    res.status(500).json({
      error: "internal_error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
};
