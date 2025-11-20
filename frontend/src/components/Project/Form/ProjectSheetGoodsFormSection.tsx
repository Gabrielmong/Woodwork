import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Stack, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { CreateProjectSheetGoodInput } from '../../../types/project';
import type { SheetGood } from '../../../types/sheetGood';
import SheetGoodInput from '../../SheetGood/SheetGoodInput';

interface ProjectSheetGoodsFormSectionProps {
  projectSheetGoods: CreateProjectSheetGoodInput[];
  sheetGoodOptions: SheetGood[];
  onAddSheetGood: () => void;
  onSheetGoodChange: (index: number, projectSheetGood: CreateProjectSheetGoodInput) => void;
  onRemoveSheetGood: (index: number) => void;
}

export function ProjectSheetGoodsFormSection({
  projectSheetGoods,
  sheetGoodOptions,
  onAddSheetGood,
  onSheetGoodChange,
  onRemoveSheetGood,
}: ProjectSheetGoodsFormSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {t('project.form.sheetGoodsSectionTitle')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddSheetGood}
            disabled={sheetGoodOptions.length === 0}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'rgba(99, 91, 255, 0.08)',
              },
            }}
          >
            {t('project.form.addSheetGood')}
          </Button>
        </Box>

        {projectSheetGoods.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.default',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('project.form.noSheetGoodsAdded')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {projectSheetGoods.map((projectSheetGood, index) => (
              <SheetGoodInput
                key={index}
                projectSheetGood={projectSheetGood}
                index={index}
                sheetGoodOptions={sheetGoodOptions}
                onChange={onSheetGoodChange}
                onRemove={onRemoveSheetGood}
              />
            ))}
          </Stack>
        )}
      </Box>
      <Divider />
    </>
  );
}
