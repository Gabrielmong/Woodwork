import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Stack, Box, Paper, Chip } from '@mui/material';
import { useCurrency } from '../../../utils/currency';

interface Consumable {
  id: string;
  name: string;
  description?: string;
  price: number;
  packageQuantity: number;
  tags?: string[];
}

interface ProjectConsumable {
  id: string;
  quantity: number;
  consumable?: Consumable;
}

interface ProjectConsumablesSectionProps {
  projectConsumables: ProjectConsumable[];
}

export function ProjectConsumablesSection({ projectConsumables }: ProjectConsumablesSectionProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  if (!projectConsumables || projectConsumables.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('projectDetails.consumables')}
        </Typography>
        <Stack spacing={2}>
          {projectConsumables.map((projectConsumable: any) => {
            const consumable = projectConsumable.consumable;
            if (!consumable) return null;

            const unitPrice = consumable.price / consumable.packageQuantity;
            const totalCost = projectConsumable.quantity * unitPrice;

            return (
              <Paper
                key={projectConsumable.id}
                sx={{
                  p: 2.5,
                  bgcolor: 'rgba(255, 152, 0, 0.03)',
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
                      {consumable.name}{' '}
                      <Chip
                        label={`${t('projectDetails.qty')}: ${projectConsumable.quantity} ${t('projectDetails.items')}`}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {consumable.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {t('projectDetails.packageSize')}: {consumable.packageQuantity} {t('projectDetails.items')} • {t('projectDetails.packagePrice')}:{' '}
                      {formatCurrency(consumable.price)} • {t('projectDetails.unitPrice')}: {formatCurrency(unitPrice)}
                    </Typography>
                    {consumable.tags && consumable.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {consumable.tags.map((tag: string, idx: number) => (
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
                      {t('projectDetails.unitPrice')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {formatCurrency(unitPrice)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('projectDetails.totalCostLabel')} ({projectConsumable.quantity} {t('projectDetails.items')})
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(totalCost)}
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
