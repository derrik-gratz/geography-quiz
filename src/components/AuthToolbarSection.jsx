import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { supabase } from '@/utils/supabase.js';
import { GoogleSignInButton } from '@/components/GoogleSignInButton.jsx';

function displayNameFromUser(user) {
  if (!user) return '';
  const meta = user.user_metadata ?? {};
  return meta.full_name ?? meta.name ?? meta.user_name ?? '';
}

export function AuthToolbarSection() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const hasSupabase = Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      (import.meta.env.VITE_SUPABASE_KEY ??
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
  );

  if (!hasSupabase) {
    return null;
  }

  if (user) {
    const label = displayNameFromUser(user);
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {label ? (
          <Typography variant="body2" color="inherit" sx={{ maxWidth: 160 }} noWrap>
            {label}
          </Typography>
        ) : null}
        <Button color="inherit" size="small" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </Box>
    );
  }

  if (!hasGoogleClientId) {
    return null;
  }

  return <GoogleSignInButton />;
}
