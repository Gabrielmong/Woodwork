import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Stack, Box, Divider } from '@mui/material';
import { useCurrency } from '../../../utils/currency';

interface ProjectCostBreakdownProps {
  materialCost: number;
  finishCost: number;
  sheetGoodCost: number;
  consumableCost: number;
  laborCost: number;
  miscCost: number;
  totalCost: number;
  additionalNotes?: string;
}

export function ProjectCostBreakdown({
  materialCost,
  finishCost,
  sheetGoodCost,
  consumableCost,
  laborCost,
  miscCost,
  totalCost,
  additionalNotes,
}: ProjectCostBreakdownProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('projectDetails.costBreakdown')}
        </Typography>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1" color="text.secondary">
              {t('projectDetails.materials')}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatCurrency(materialCost)}
            </Typography>
          </Box>
          {finishCost > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="text.secondary">
                {t('projectDetails.finishes')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(finishCost)}
              </Typography>
            </Box>
          )}
          {sheetGoodCost > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="text.secondary">
                {t('projectDetails.sheetGoods')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(sheetGoodCost)}
              </Typography>
            </Box>
          )}
          {consumableCost > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="text.secondary">
                {t('projectDetails.consumables')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(consumableCost)}
              </Typography>
            </Box>
          )}
          {laborCost > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="text.secondary">
                {t('projectDetails.labor')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(laborCost)}
              </Typography>
            </Box>
          )}
          {miscCost > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="text.secondary">
                {t('projectDetails.miscellaneous')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(miscCost)}
              </Typography>
            </Box>
          )}
          {additionalNotes && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {t('common.notes')}:
              </Typography>
              <Typography variant="body2">{additionalNotes}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              bgcolor: 'rgba(0, 217, 36, 0.08)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {t('projectDetails.totalCost')}
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {formatCurrency(totalCost)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
