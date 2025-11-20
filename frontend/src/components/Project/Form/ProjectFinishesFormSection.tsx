import { useTranslation } from 'react-i18next';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import type { Finish } from '../../../types/finish';

interface ProjectFinishesFormSectionProps {
  finishIds: string[];
  finishOptions: Finish[];
  onFinishIdsChange: (value: string[]) => void;
}

export function ProjectFinishesFormSection({
  finishIds,
  finishOptions,
  onFinishIdsChange,
}: ProjectFinishesFormSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <FormControl fullWidth>
        <InputLabel>{t('project.form.finishesSectionTitle')}</InputLabel>
        <Select
          multiple
          value={finishIds}
          onChange={(e) =>
            onFinishIdsChange(
              typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
            )
          }
          input={<OutlinedInput label={t('project.form.finishesSectionTitle')} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((id) => {
                const finish = finishOptions.find((f) => f.id === id);
                return (
                  <Chip
                    key={id}
                    label={finish?.name || id}
                    size="small"
                    sx={{ bgcolor: 'background.default' }}
                  />
                );
              })}
            </Box>
          )}
        >
          {finishOptions.map((finish) => (
            <MenuItem key={finish.id} value={finish.id}>
              {finish.name} - {finish.price.toFixed(2)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider />
    </>
  );
}
