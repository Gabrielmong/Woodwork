import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Stack, Box, Divider } from '@mui/material';
import { useCurrency } from '../../../utils/currency';

interface ProjectSummaryProps {
  totalBoardFootage: number;
  boardCount: number;
  totalCost: number;
}

export function ProjectSummary({ totalBoardFootage, boardCount, totalCost }: ProjectSummaryProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('projectDetails.projectSummary')}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('projectDetails.totalBoardFeet')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {totalBoardFootage.toFixed(2)} BF
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('projectDetails.boardTypes')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {boardCount}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('projectDetails.totalCost')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
              {formatCurrency(totalCost)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
