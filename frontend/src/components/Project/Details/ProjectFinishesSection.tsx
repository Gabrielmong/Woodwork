import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Stack, Box, Paper, Chip } from '@mui/material';
import type { ProjectFinish } from '../../../types/project';

interface ProjectFinishesSectionProps {
  projectFinishes?: ProjectFinish[];
  formatCurrency: (amount: number) => string;
}

export function ProjectFinishesSection({
  projectFinishes,
  formatCurrency,
}: ProjectFinishesSectionProps) {
  const { t } = useTranslation();

  if (!projectFinishes || projectFinishes.length === 0) {
    return null;
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('projectDetails.finishes')}
        </Typography>
        <Stack spacing={2}>
          {projectFinishes.map((projectFinish: ProjectFinish) => {
            const finish = projectFinish.finish;
            if (!finish) return null;

            const totalFinishCost = finish.price * projectFinish.quantity;

            const cost =
              (finish.price * projectFinish.percentageUsed * projectFinish.quantity) / 100;

            return (
              <Paper
                key={projectFinish.id}
                sx={{
                  p: 2.5,
                  bgcolor: 'rgba(0, 217, 36, 0.03)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={2}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {finish.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {finish.description}
                    </Typography>
                    <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${t('common.quantity')}: ${projectFinish.quantity}`}
                        size="small"
                        color="secondary"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Chip
                        label={`${projectFinish.percentageUsed}% ${t('finishes.percentageUsed')}`}
                        size="small"
                        color="primary"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      {t('common.price')}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {formatCurrency(totalFinishCost)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(cost)}
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
