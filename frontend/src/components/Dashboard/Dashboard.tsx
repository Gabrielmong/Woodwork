import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import FolderIcon from '@mui/icons-material/Folder';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GET_DASHBOARD_STATS, GET_SETTINGS } from '../../graphql/operations';
import { useCurrency } from '../../utils/currency';
import { useDispatch } from 'react-redux';
import { setCurrency, setLanguage, setThemeMode } from '../../store/settings/settingsSlice';
import type { Currency, Language, ThemeMode } from '../../types';
import { Paid } from '@mui/icons-material';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const formatCurrency = useCurrency();
  const dispatch = useDispatch();

  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS);

  const { loading: settingsLoading } = useQuery(GET_SETTINGS, {
    onCompleted: (data) => {
      // Sync backend settings to Redux
      if (data.settings) {
        dispatch(setCurrency(data.settings.currency as Currency));
        dispatch(setLanguage(data.settings.language as Language));
        dispatch(setThemeMode(data.settings.themeMode as ThemeMode));
      }
    },
  });

  if (loading || settingsLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading dashboard: {error.message}</Typography>
      </Box>
    );
  }

  const stats = data?.dashboardStats || {
    totalProjects: 0,
    totalLumber: 0,
    totalFinishes: 0,
    totalSheetGoods: 0,
    totalTools: 0,
    totalProjectCost: 0,
    totalBoardFeet: 0,
    avgCostPerBF: 0,
    totalToolsValue: 0,
  };

  const statCards = [
    {
      title: t('dashboard.activeProjects'),
      value: stats.totalProjects,
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      color: '#3B82F6',
      action: () => navigate('/app/projects'),
    },
    {
      title: t('dashboard.lumberTypes'),
      value: stats.totalLumber,
      icon: <ViewModuleIcon sx={{ fontSize: 40 }} />,
      color: '#34D399',
      action: () => navigate('/app/lumber'),
    },
    {
      title: t('dashboard.finishOptions'),
      value: stats.totalFinishes,
      icon: <FormatPaintIcon sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      action: () => navigate('/app/finishes'),
    },
    {
      title: t('dashboard.sheetGoodOptions'),
      value: stats.totalSheetGoods,
      icon: <ViewModuleIcon sx={{ fontSize: 40 }} />,
      color: '#8B5CF6',
      action: () => navigate('/app/sheet-goods'),
    },
    {
      title: t('dashboard.toolInventory'),
      value: stats.totalTools,
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      color: '#EF4444',
      action: () => navigate('/app/tools'),
    },
  ];

  const metricCards = [
    {
      title: t('dashboard.totalProjectValue'),
      value: formatCurrency(stats.totalProjectCost),
      icon: <AttachMoneyIcon sx={{ fontSize: 32 }} />,
      trend: '+12%',
    },
    {
      title: t('dashboard.totalProfit'),
      value: formatCurrency(stats.totalProfit),
      icon: <Paid sx={{ fontSize: 32 }} />,
      trend: '+8%',
    },
    {
      title: t('dashboard.avgCostPerBF'),
      value: formatCurrency(stats.avgCostPerBF),
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      trend: '-3%',
    },
    {
      title: t('dashboard.totalToolsValue'),
      value: formatCurrency(stats.totalToolsValue),
      icon: <BuildIcon sx={{ fontSize: 32 }} />,
      trend: '+5%',
    },
  ];

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
        {t('dashboard.title')}
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
        {t('dashboard.subtitle')}
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={{ xs: 2, md: 3, lg: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={stat.action}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '1.5rem', md: '2rem' },
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Metrics Section */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          mb: { xs: 4, md: 6 },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {t('dashboard.keyMetrics')}
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {metricCards.map((metric, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={index}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {metric.value}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          {t('dashboard.quickActions')}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<FolderIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/app/projects?action=new')}
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {t('dashboard.newProject')}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<ViewModuleIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/app/lumber?action=new')}
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {t('dashboard.addLumber')}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<FormatPaintIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/app/finishes?action=new')}
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {t('dashboard.addFinish')}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<ViewModuleIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/app/sheet-goods?action=new')}
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {t('dashboard.addSheetGood')}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<BuildIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/app/tools?action=new')}
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {t('dashboard.addTool')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
