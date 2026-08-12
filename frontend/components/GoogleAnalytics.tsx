import Script from "next/script";
import { Suspense } from "react";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { GaPageViewTracker } from "@/components/GaPageViewTracker";

/**
 * Loads GA4 in the root layout (Server Component) so beforeInteractive works.
 * Client pageviews are handled by GaPageViewTracker.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* Stub early so events queue before the remote script loads */}
      <Script id="ga4-stub" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag(){window.dataLayer.push(arguments);};
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            anonymize_ip: true
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <GaPageViewTracker />
      </Suspense>
    </>
  );
}
