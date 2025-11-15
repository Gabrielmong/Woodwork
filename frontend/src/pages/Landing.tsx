import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Stack,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import BuildIcon from '@mui/icons-material/Build';
import FolderIcon from '@mui/icons-material/Folder';
import CalculateIcon from '@mui/icons-material/Calculate';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const features = [
    {
      icon: <FolderIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: t('landing.features.projects.title'),
      description: t('landing.features.projects.description'),
    },
    {
      icon: <ViewModuleIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: t('landing.features.lumber.title'),
      description: t('landing.features.lumber.description'),
    },
    {
      icon: <FormatPaintIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: t('landing.features.finishes.title'),
      description: t('landing.features.finishes.description'),
    },
    {
      icon: <BuildIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: t('landing.features.tools.title'),
      description: t('landing.features.tools.description'),
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: t('landing.features.calculations.title'),
      description: t('landing.features.calculations.description'),
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: t('landing.features.tracking.title'),
      description: t('landing.features.tracking.description'),
    },
  ];

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
          {isAuthenticated ? (
            <Button
              variant="outlined"
              onClick={() => navigate('/app')}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
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
            <Stack direction="row" spacing={2}>
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
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, rgba(99, 91, 255, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                background: 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('landing.hero.title')}
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                mb: 5,
                fontSize: { xs: '1.125rem', md: '1.5rem' },
                lineHeight: 1.6,
              }}
            >
              {t('landing.hero.subtitle')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 5,
                  py: 1.5,
                  fontSize: '1.125rem',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                {t('landing.hero.getStarted')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 5,
                  py: 1.5,
                  fontSize: '1.125rem',
                }}
              >
                {t('landing.hero.learnMore')}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
            }}
          >
            {t('landing.features.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            {t('landing.features.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(99, 91, 255, 0.15)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)',
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'white',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              {t('landing.cta.title')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.9)' }}>
              {t('landing.cta.subtitle')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 5,
                py: 1.5,
                fontSize: '1.125rem',
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              {t('landing.cta.button')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} {t('app.title')}. {t('landing.footer.rights')}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
