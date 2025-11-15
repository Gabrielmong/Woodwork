import { useState } from 'react';
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
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrency, setLanguage, setThemeMode } from '../../store/settings/settingsSlice';
import { updateUser } from '../../store/authSlice';
import { GET_SETTINGS, UPDATE_SETTINGS } from '../../graphql/operations';
import { GET_ME, UPDATE_USER, CHANGE_PASSWORD } from '../../graphql/auth';
import {
  CURRENCY_NAMES,
  LANGUAGE_NAMES,
  type Currency,
  type Language,
  type ThemeMode,
} from '../../types/settings';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Account() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user data
  const { data: userData, loading: userLoading } = useQuery(GET_ME, {
    onCompleted: (data) => {
      if (data.me) {
        setProfileForm({
          firstName: data.me.firstName || '',
          lastName: data.me.lastName || '',
          email: data.me.email || '',
          dateOfBirth: data.me.dateOfBirth ? data.me.dateOfBirth.split('T')[0] : '',
        });
      }
    },
  });

  // Fetch settings from backend
  const { loading: settingsLoading } = useQuery(GET_SETTINGS, {
    onCompleted: (data) => {
      if (data.settings) {
        dispatch(setCurrency(data.settings.currency as Currency));
        dispatch(setLanguage(data.settings.language as Language));
        dispatch(setThemeMode(data.settings.themeMode as ThemeMode));
      }
    },
  });

  const [updateSettings] = useMutation(UPDATE_SETTINGS);
  const [updateUserMutation] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_ME }],
  });
  const [changePasswordMutation] = useMutation(CHANGE_PASSWORD);

  const user = userData?.me || currentUser;

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

  const handleEditProfile = () => {
    setEditProfileOpen(true);
    setSuccessMessage('');
  };

  const handleProfileUpdate = async () => {
    try {
      const input: any = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
      };

      if (profileForm.email) {
        input.email = profileForm.email;
      }

      if (profileForm.dateOfBirth) {
        input.dateOfBirth = new Date(profileForm.dateOfBirth).toISOString();
      }

      const { data } = await updateUserMutation({
        variables: { input },
      });

      if (data?.updateUser) {
        dispatch(updateUser(data.updateUser));
        setSuccessMessage(t('account.profileUpdatedSuccess'));
        setEditProfileOpen(false);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('account.newPasswordsDoNotMatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t('account.passwordMinLength'));
      return;
    }

    try {
      await changePasswordMutation({
        variables: {
          input: {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          },
        },
      });

      setSuccessMessage(t('account.passwordChangedSuccess'));
      setChangePasswordOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const { data } = await updateUserMutation({
          variables: {
            input: {
              imageData: base64String,
            },
          },
        });

        if (data?.updateUser) {
          dispatch(updateUser(data.updateUser));
          setSuccessMessage(t('account.profilePictureUpdatedSuccess'));
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  if (userLoading || settingsLoading) {
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
        {t('account.title')}
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
        {t('account.subtitle')}
      </Typography>

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3, maxWidth: 600 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      <Stack spacing={3} sx={{ maxWidth: 600 }}>
        {/* Profile Information */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('account.profileInformation')}
              </Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {t('common.editProfile')}
              </Button>
            </Stack>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user?.imageData}
                    sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </IconButton>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{user?.username}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  {t('account.email')}
                </Typography>
                <Typography variant="body1">{user?.email || t('common.notSet')}</Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  {t('account.dateOfBirth')}
                </Typography>
                <Typography variant="body1">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : t('common.notSet')}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  {t('account.memberSince')}
                </Typography>
                <Typography variant="body1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('common.unknown')}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                onClick={() => setChangePasswordOpen(true)}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
              >
                {t('common.changePassword')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

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
            {t('account.allChangesAutoSaved')}
          </Typography>
        </Box>
      </Stack>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('common.editProfile')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('account.firstName')}
              fullWidth
              value={profileForm.firstName}
              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
            />
            <TextField
              label={t('account.lastName')}
              fullWidth
              value={profileForm.lastName}
              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
            />
            <TextField
              label={t('account.email')}
              type="email"
              fullWidth
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
            <TextField
              label={t('account.dateOfBirth')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={profileForm.dateOfBirth}
              onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleProfileUpdate}>
            {t('common.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('common.changePassword')}</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('account.currentPassword')}
              type={showPasswords.current ? 'text' : 'password'}
              fullWidth
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                      }
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={t('account.newPassword')}
              type={showPasswords.new ? 'text' : 'password'}
              fullWidth
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                      }
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={t('account.confirmNewPassword')}
              type={showPasswords.confirm ? 'text' : 'password'}
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                      }
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            {t('common.changePassword')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
