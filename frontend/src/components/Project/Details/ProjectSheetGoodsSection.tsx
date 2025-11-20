import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Stack, Box, Paper, Chip } from '@mui/material';
import { useCurrency } from '../../../utils/currency';

interface SheetGood {
  id: string;
  name: string;
  description?: string;
  width: number;
  length: number;
  thickness: number;
  materialType: string;
  price: number;
  tags?: string[];
}

interface ProjectSheetGood {
  id: string;
  quantity: number;
  sheetGood?: SheetGood;
}

interface ProjectSheetGoodsSectionProps {
  projectSheetGoods: ProjectSheetGood[];
}

export function ProjectSheetGoodsSection({ projectSheetGoods }: ProjectSheetGoodsSectionProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  if (!projectSheetGoods || projectSheetGoods.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('projectDetails.sheetGoods')}
        </Typography>
        <Stack spacing={2}>
          {projectSheetGoods.map((projectSheetGood: any) => {
            const sheetGood = projectSheetGood.sheetGood;
            if (!sheetGood) return null;

            return (
              <Paper
                key={projectSheetGood.id}
                sx={{
                  p: 2.5,
                  bgcolor: 'rgba(99, 91, 255, 0.03)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {sheetGood.name}{' '}
                      <Chip label={`${t('projectDetails.qty')}: ${projectSheetGood.quantity}`} size="small" sx={{ ml: 1 }} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {sheetGood.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {t('projectDetails.dimensions')}: {sheetGood.width}" × {sheetGood.length}" × {sheetGood.thickness}" •
                      {t('projectDetails.material')}: {sheetGood.materialType}
                    </Typography>
                    {sheetGood.tags && sheetGood.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {sheetGood.tags.map((tag: string, idx: number) => (
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
                      {formatCurrency(sheetGood.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('projectDetails.totalCostLabel')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(sheetGood.price * projectSheetGood.quantity)}
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
