import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  Grid,
  FormControlLabel,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, Home } from '@mui/icons-material';
import { REGISTER } from '../graphql/auth';
import { setCredentials } from '../store/authSlice';
import { t } from 'i18next';
import type { RootState } from '../store/store';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    hasAcceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [register, { loading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      dispatch(setCredentials(data.register));
      navigate('/app');
    },
    onError: (error) => {
      setError(error.message || t('register.failed'));
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hasAcceptedTerms' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.password || !formData.firstName || !formData.lastName) {
      setError(t('register.fillAllFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }

    if (!formData.hasAcceptedTerms) {
      setError(t('register.mustAcceptTerms'));
      return;
    }

    const { confirmPassword, ...registerInput } = formData;

    await register({
      variables: {
        input: registerInput,
      },
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('app.title')}
          </Typography>
          <Button
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {t('landing.backToHome')}
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PersonAdd sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography component="h1" variant="h5" gutterBottom>
                {t('register.createAccount')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('register.joinMessage')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label={t('register.firstName')}
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label={t('register.lastName')}
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label={t('register.username')}
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    id="email"
                    label={t('register.email')}
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label={t('register.password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label={t('register.confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasAcceptedTerms"
                        color="primary"
                        checked={formData.hasAcceptedTerms}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    }
                    label={t('register.acceptTerms')}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? t('register.creatingAccount') : t('register.signUp')}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  {t('register.alreadyHaveAccount')}
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
