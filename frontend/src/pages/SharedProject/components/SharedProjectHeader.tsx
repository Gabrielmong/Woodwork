import { useTranslation } from 'react-i18next';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { LanguageSelector } from '../../../components/General';

interface SharedProjectHeaderProps {
  onGoToApp: () => void;
}

export function SharedProjectHeader({ onGoToApp }: SharedProjectHeaderProps) {
  const { t } = useTranslation();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {t('app.title')}
        </Typography>
        <LanguageSelector />
        <Button variant="contained" color="primary" onClick={onGoToApp} sx={{ ml: 1 }}>
          {t('shared.goToApp')}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
