import {
  AppBar as MuiAppBar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
  Avatar,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { LanguageSelector } from '../General';

export const Appbar = ({ showSignInUp = true }: { showSignInUp?: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <MuiAppBar
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
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('app.title')}
        </Typography>
        <LanguageSelector />
        {isAuthenticated ? (
          <Button
            variant="outlined"
            onClick={() => navigate('/app')}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              ml: 1,
            }}
          >
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
                  src={user.imageData}
                >
                  {t('landing.goToApp')}
                </Avatar>
                <Box sx={{ ml: 2 }}>{t('landing.goToApp')}</Box>
              </Box>
            )}
          </Button>
        ) : (
          showSignInUp && (
            <Stack direction="row" spacing={2} sx={{ ml: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {t('landing.signIn')}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                {t('landing.signUp')}
              </Button>
            </Stack>
          )
        )}
      </Toolbar>
    </MuiAppBar>
  );
};
