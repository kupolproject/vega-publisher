(() => {
  "use strict";

  const CONSENT_KEY = "vega_analytics_consent_v1";
  const measurementMeta = document.querySelector(
    'meta[name="vega-ga4-measurement-id"]'
  );
  const measurementId = measurementMeta
    ? measurementMeta.content.trim().toUpperCase()
    : "";
  const validMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId);
  const consentBanner = document.getElementById("analytics-consent");
  const allowButton = document.getElementById("analytics-allow");
  const essentialButton = document.getElementById("analytics-essential");
  let analyticsEnabled = false;
  let analyticsConfigured = false;
  let pageViewSent = false;

  const readConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY) || "";
    } catch (_error) {
      return "";
    }
  };

  const storeConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (_error) {
      // The current page still follows the selected choice for this visit.
    }
  };

  const updateConsent = (analyticsStorage) => {
    if (typeof window.gtag !== "function") {
      return;
    }
    window.gtag("consent", "update", {
      analytics_storage: analyticsStorage,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  };

  const enableAnalytics = () => {
    if (!validMeasurementId || typeof window.gtag !== "function") {
      return;
    }
    analyticsEnabled = true;
    updateConsent("granted");
    if (!analyticsConfigured) {
      window.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      analyticsConfigured = true;
    }
    if (!pageViewSent) {
      window.gtag("event", "page_view");
      pageViewSent = true;
    }
  };

  const denyAnalytics = () => {
    analyticsEnabled = false;
    updateConsent("denied");
  };

  const hideBanner = () => {
    if (consentBanner) {
      consentBanner.hidden = true;
    }
  };

  const savedConsent = readConsent();
  if (savedConsent === "granted") {
    enableAnalytics();
  } else if (savedConsent === "denied") {
    denyAnalytics();
  } else if (consentBanner) {
    consentBanner.hidden = false;
  }

  if (allowButton) {
    allowButton.addEventListener("click", () => {
      storeConsent("granted");
      enableAnalytics();
      hideBanner();
    });
  }

  if (essentialButton) {
    essentialButton.addEventListener("click", () => {
      storeConsent("denied");
      denyAnalytics();
      hideBanner();
    });
  }

  const campaign = new URLSearchParams(window.location.search);
  const campaignValue = (name) => campaign.get(name) || "";

  document.addEventListener("click", (event) => {
    const link = event.target.closest(
      'a[data-gumroad-location], a[href*="tealeafbooks.gumroad.com/l/vega-publisher-lite"]'
    );
    if (
      !link ||
      !analyticsEnabled ||
      typeof window.gtag !== "function"
    ) {
      return;
    }

    window.gtag("event", "gumroad_checkout_click", {
      link_url: link.href,
      button_location: link.dataset.gumroadLocation || "unknown",
      utm_source: campaignValue("utm_source"),
      utm_medium: campaignValue("utm_medium"),
      utm_campaign: campaignValue("utm_campaign"),
      utm_content: campaignValue("utm_content"),
      transport_type: "beacon",
    });
  });
})();
