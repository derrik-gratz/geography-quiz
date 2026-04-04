import { useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase.js';

/**
 * Renders Google's pre-built Sign in with Google button (GSI) and exchanges the ID token
 * with Supabase via signInWithIdToken — see https://supabase.com/docs/guides/auth/social-login/auth-google#google-pre-built
 */
export function GoogleSignInButton() {
  const containerRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !containerRef.current) {
      return undefined;
    }

    let cancelled = false;
    let intervalId;

    function mountButton() {
      if (cancelled || !containerRef.current || !globalThis.google?.accounts?.id) {
        return;
      }

      globalThis.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
          });
          if (error) {
            console.error('signInWithIdToken', error.message);
          }
        },
        use_fedcm_for_prompt: true,
      });

      containerRef.current.replaceChildren();
      globalThis.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
      });
    }

    if (globalThis.google?.accounts?.id) {
      mountButton();
    } else {
      intervalId = globalThis.setInterval(() => {
        if (globalThis.google?.accounts?.id) {
          globalThis.clearInterval(intervalId);
          mountButton();
        }
      }, 50);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        globalThis.clearInterval(intervalId);
      }
      if (globalThis.google?.accounts?.id && containerRef.current) {
        globalThis.google.accounts.id.cancel();
      }
    };
  }, []);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return null;
  }

  return <div ref={containerRef} className="google-sign-in-button" />;
}
