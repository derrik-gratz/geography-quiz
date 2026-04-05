import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '@/utils/supabase.js';
import { GoogleSignInButton } from './GoogleSignInButton.jsx';

function appBasePath() {
  const base = import.meta.env.BASE_URL ?? '/';
  return new URL(base, window.location.origin).pathname;
}

function replaceUrlToAppRoot() {
  window.history.replaceState({}, document.title, appBasePath());
}

/**
 * Profile login: magic link (OTP) + optional Google, following
 * https://supabase.com/docs/guides/auth/quickstarts/react
 * Configure Auth email templates + Site URL in the Supabase Dashboard for magic links to work.
 */
export function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [claims, setClaims] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const hasTokenHash = Boolean(params.get('token_hash'));

  const [verifying, setVerifying] = useState(hasTokenHash);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (token_hash) {
      supabase.auth
        .verifyOtp({
          token_hash,
          type: type || 'email',
        })
        .then(({ error }) => {
          if (error) {
            setAuthError(error.message);
          } else {
            setAuthSuccess(true);
            replaceUrlToAppRoot();
          }
          setVerifying(false);
        });
    }

    const applyClaims = (raw) => {
      const c = raw ?? null;
      setClaims(c?.sub ? c : null);
    };

    supabase.auth.getClaims().then(({ data }) => {
      applyClaims(data?.claims);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data }) => {
        applyClaims(data?.claims);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const emailRedirectTo = new URL(
      import.meta.env.BASE_URL || '/',
      window.location.origin,
    ).href;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });
    if (error) {
      window.alert(error.message);
    } else {
      window.alert('Check your email for the login link!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setClaims(null);
  };

  if (verifying) {
    return (
      <Box className="profile-page__login" sx={{ maxWidth: 480, mx: 'auto', py: 4, px: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Authentication
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography>Confirming your magic link…</Typography>
        </Stack>
      </Box>
    );
  }

  if (authError) {
    return (
      <Box className="profile-page__login" sx={{ maxWidth: 480, mx: 'auto', py: 4, px: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Authentication
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {authError}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setAuthError(null);
            replaceUrlToAppRoot();
          }}
        >
          Return to login
        </Button>
      </Box>
    );
  }

  if (authSuccess && !claims?.sub) {
    return (
      <Box className="profile-page__login" sx={{ maxWidth: 480, mx: 'auto', py: 4, px: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Authentication
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography>Authentication successful. Loading your account…</Typography>
        </Stack>
      </Box>
    );
  }

  if (claims?.sub) {
    return (
      <Box className="profile-page__login" sx={{ maxWidth: 480, mx: 'auto', py: 4, px: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Signed in
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You are logged in{claims.email ? ` as ${claims.email}` : ''}.
        </Typography>
        <Button variant="outlined" onClick={handleLogout}>
          Sign out
        </Button>
      </Box>
    );
  }

  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <Box className="profile-page__login" sx={{ maxWidth: 480, mx: 'auto', py: 4, px: 2 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign in with a magic link sent to your email, or use Google if configured.
          </Typography>
          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                required
                fullWidth
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="contained" disabled={loading} fullWidth>
                {loading ? 'Sending…' : 'Send magic link'}
              </Button>
            </Stack>
          </Box>
          {hasGoogleClientId ? (
            <>
              <Divider sx={{ my: 3 }}>or</Divider>
              <Stack alignItems="center">
                <GoogleSignInButton />
              </Stack>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
