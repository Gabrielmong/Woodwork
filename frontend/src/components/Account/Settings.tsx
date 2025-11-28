import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrency, setLanguage, setThemeMode } from '../../store/settings/settingsSlice';
import { GET_SETTINGS, UPDATE_SETTINGS } from '../../graphql';
import {
  CURRENCY_NAMES,
  LANGUAGE_NAMES,
  type Currency,
  type Language,
  type ThemeMode,
} from '../../types/settings';

export default function Settings() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  // Fetch settings from backend
  const { loading } = useQuery(GET_SETTINGS, {
    onCompleted: (data) => {
      // Sync backend settings to Redux
      if (data.settings) {
        dispatch(setCurrency(data.settings.currency as Currency));
        dispatch(setLanguage(data.settings.language as Language));
        dispatch(setThemeMode(data.settings.themeMode as ThemeMode));
      }
    },
  });

  // Mutation to update settings
  const [updateSettings] = useMutation(UPDATE_SETTINGS);

  const handleCurrencyChange = async (currency: Currency) => {
    dispatch(setCurrency(currency));
    await updateSettings({
      variables: {
        input: { currency },
      },
    });
  };

  const handleLanguageChange = async (language: Language) => {
    dispatch(setLanguage(language));
    await updateSettings({
      variables: {
        input: { language },
      },
    });
  };

  const handleThemeModeChange = async (themeMode: ThemeMode) => {
    dispatch(setThemeMode(themeMode));
    await updateSettings({
      variables: {
        input: { themeMode },
      },
    });
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          mb: { xs: 1, md: 1.5 },
          fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' },
        }}
      >
        {t('settings.title')}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
          maxWidth: '600px',
          mb: { xs: 4, md: 6 },
        }}
      >
        {t('settings.subtitle')}
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 600 }}>
        {/* Appearance */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              {t('settings.appearance')}
            </Typography>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>{t('settings.theme')}</InputLabel>
                <Select
                  value={settings.themeMode}
                  label={t('settings.theme')}
                  onChange={(e) => handleThemeModeChange(e.target.value as ThemeMode)}
                >
                  <MenuItem value="light">{t('settings.light')}</MenuItem>
                  <MenuItem value="dark">{t('settings.dark')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              {t('settings.localization')}
            </Typography>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>{t('settings.language')}</InputLabel>
                <Select
                  value={settings.language}
                  label={t('settings.language')}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                >
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <MenuItem key={code} value={code}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>{t('settings.currency')}</InputLabel>
                <Select
                  value={settings.currency}
                  label={t('settings.currency')}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                >
                  {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                    <MenuItem key={code} value={code}>
                      {name} ({code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'rgba(99, 91, 255, 0.05)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(99, 91, 255, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('settings.saveMessage')}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
