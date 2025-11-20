import { Box, Typography, Button, Stack, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { CreateProjectConsumableInput } from '../../../types/project';
import type { Consumable } from '../../../types/consumable';
import ConsumableInput from '../../Consumable/ConsumableInput';
import { useTranslation } from 'react-i18next';

interface ProjectConsumablesFormSectionProps {
  projectConsumables: CreateProjectConsumableInput[];
  consumableOptions: Consumable[];
  onAddConsumable: () => void;
  onConsumableChange: (index: number, projectConsumable: CreateProjectConsumableInput) => void;
  onRemoveConsumable: (index: number) => void;
}

export function ProjectConsumablesFormSection({
  projectConsumables,
  consumableOptions,
  onAddConsumable,
  onConsumableChange,
  onRemoveConsumable,
}: ProjectConsumablesFormSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {t('project.form.consumablesSectionTitle')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddConsumable}
            disabled={consumableOptions.length === 0}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'rgba(99, 91, 255, 0.08)',
              },
            }}
          >
            {t('project.form.addConsumable')}
</Button>
        </Box>

        {projectConsumables.length === 0 ? (
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
              {t('project.form.noConsumablesAdded')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {projectConsumables.map((projectConsumable, index) => (
              <ConsumableInput
                key={index}
                projectConsumable={projectConsumable}
                index={index}
                consumableOptions={consumableOptions}
                onChange={onConsumableChange}
                onRemove={onRemoveConsumable}
              />
            ))}
          </Stack>
        )}
      </Box>
      <Divider />
    </>
  );
}
