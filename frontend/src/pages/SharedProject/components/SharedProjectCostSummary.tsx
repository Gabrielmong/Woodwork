import { useTranslation } from 'react-i18next';
import { Grid, Card, CardContent, Typography } from '@mui/material';

interface SharedProjectCostSummaryProps {
  materialCost: number;
  sheetGoodsCost?: number;
  consumableCost?: number;
  finishCost: number;
  laborCost: number;
  miscCost: number;
  totalCost: number;
  formatCurrency: (amount: number) => string;
}

export function SharedProjectCostSummary({
  materialCost,
  sheetGoodsCost,
  consumableCost,
  finishCost,
  laborCost,
  miscCost,
  totalCost,
  formatCurrency,
}: SharedProjectCostSummaryProps) {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3}>
      {materialCost !== 0 && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('shared.lumberCost')}
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatCurrency(materialCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
      {sheetGoodsCost !== undefined && sheetGoodsCost !== 0 && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('shared.sheetGoodCost')}
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatCurrency(sheetGoodsCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
      {consumableCost !== undefined && consumableCost !== 0 && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('shared.consumableCost')}
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatCurrency(consumableCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {t('shared.finishCost')}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {formatCurrency(finishCost)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {t('shared.laborCost')}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {formatCurrency(laborCost)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {t('shared.miscCost')}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {formatCurrency(miscCost)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card
          sx={{
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          <CardContent>
            <Typography gutterBottom variant="body2" sx={{ color: 'primary.contrastText', opacity: 0.9 }}>
              {t('shared.totalCost')}
            </Typography>
            <Typography variant="h5" fontWeight={600} sx={{ color: 'primary.contrastText' }}>
              {formatCurrency(totalCost)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
