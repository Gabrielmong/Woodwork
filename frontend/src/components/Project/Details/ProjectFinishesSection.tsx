import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Stack, Box, Paper, Chip } from '@mui/material';
import { useCurrency } from '../../../utils/currency';

interface Finish {
  id: string;
  name: string;
  description?: string;
  price: number;
  tags?: string[];
}

interface ProjectFinishesSectionProps {
  finishes: Finish[];
}

export function ProjectFinishesSection({ finishes }: ProjectFinishesSectionProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  if (!finishes || finishes.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('projectDetails.finishes')}
        </Typography>
        <Stack spacing={2}>
          {finishes.map((finish: any) => {
            if (!finish) return null;

            return (
              <Paper
                key={finish.id}
                sx={{
                  p: 2.5,
                  bgcolor: 'rgba(0, 217, 36, 0.03)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {finish.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {finish.description}
                    </Typography>
                    {finish.tags && finish.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {finish.tags.map((tag: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: 'background.default',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.price')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(finish.price)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
