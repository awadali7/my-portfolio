import Head from 'next/head';
import { useEffect } from 'react';

/**
 * Makes the console installable as "Myyee".
 *
 * Rendered only inside /admin, so the manifest never attaches to the public
 * portfolio — installing from the homepage would otherwise create an app
 * called Myyee that opens the CV.
 */
const MyyeePwa = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // Registered from the root so it is *allowed* to claim /admin, but scoped
    // down so it never intercepts the public site.
    navigator.serviceWorker
      .register('/sw.js', { scope: '/admin' })
      .catch(() => {
        // An unavailable worker only costs the offline page, so there is
        // nothing worth surfacing to the operator here.
      });
  }, []);

  return (
    <Head>
      <link rel='manifest' href='/myyee/manifest.webmanifest' />
      <meta name='application-name' content='Myyee' />
      <meta name='theme-color' content='#0d0d0d' />
      <meta name='mobile-web-app-capable' content='yes' />
      {/* iOS ignores the manifest for home-screen installs and reads these. */}
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-title' content='Myyee' />
      <meta
        name='apple-mobile-web-app-status-bar-style'
        content='black-translucent'
      />
      <link rel='apple-touch-icon' href='/myyee/apple-touch-icon.png' />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/myyee/favicon-32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='192x192'
        href='/myyee/icon-192.png'
      />
    </Head>
  );
};

export default MyyeePwa;
