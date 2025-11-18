import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import GridOnIcon from '@mui/icons-material/GridOn';
import BuildIcon from '@mui/icons-material/Build';
import FolderIcon from '@mui/icons-material/Folder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from '../../store/authSlice';
import type { RootState } from '../../store/store';
import packageJson from '../../../package.json';
import { resetSettings } from '../../store/settings/settingsSlice';

const DRAWER_WIDTH = 280;
const APP_VERSION = packageJson.version;

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
}

export function Sidebar({ open, onClose, variant = 'permanent' }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(resetSettings());
    dispatch(logout());
    navigate('/login');
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };

  const menuItems = [
    {
      text: t('nav.dashboard'),
      icon: <DashboardIcon />,
      path: '/app',
    },
    {
      text: t('nav.projects'),
      icon: <FolderIcon />,
      path: '/app/projects',
    },
    {
      text: t('nav.lumber'),
      icon: <ViewModuleIcon />,
      path: '/app/lumber',
    },
    {
      text: t('nav.finishes'),
      icon: <FormatPaintIcon />,
      path: '/app/finishes',
    },
    {
      text: t('nav.sheetGoods'),
      icon: <GridOnIcon />,
      path: '/app/sheet-goods',
    },
    {
      text: t('nav.tools'),
      icon: <BuildIcon />,
      path: '/app/tools',
    },
  ];

  const bottomMenuItems = [
    {
      text: t('nav.account'),
      icon: <AccountCircleIcon />,
      path: '/app/account',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Typography
            variant="h5"
            component="h1"
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
        </Link>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  bgcolor: isActive ? 'rgba(99, 91, 255, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(99, 91, 255, 0.12)' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        {/* User Info */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2 }}>
            <Avatar
              sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.main' }}
              src={user.imageData}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                @{user.username}
              </Typography>
            </Box>
          </Box>
        )}

        {bottomMenuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  bgcolor: isActive ? 'rgba(99, 91, 255, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(99, 91, 255, 0.12)' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Logout Button */}
        <ListItem disablePadding sx={{ mb: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: 'error.lighter',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'error.main',
                minWidth: 40,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('nav.logout')}
              primaryTypographyProps={{
                fontWeight: 500,
                color: 'error.main',
              }}
            />
          </ListItemButton>
        </ListItem>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Grain v{APP_VERSION}
          </Typography>
          <Typography
            component="a"
            href="https://gabrielmong.github.io/gandalfio/#/contact"
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              opacity: 0.6,
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 1,
                textDecoration: 'underline',
              },
            }}
          >
            {t('app.contactDeveloper')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
