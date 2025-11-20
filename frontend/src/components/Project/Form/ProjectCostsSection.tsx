import { useTranslation } from 'react-i18next';
import { Box, Typography, TextField, Stack } from '@mui/material';

interface ProjectCostsSectionProps {
  laborCost: string;
  miscCost: string;
  additionalNotes: string;
  onLaborCostChange: (value: string) => void;
  onMiscCostChange: (value: string) => void;
  onAdditionalNotesChange: (value: string) => void;
}

export function ProjectCostsSection({
  laborCost,
  miscCost,
  additionalNotes,
  onLaborCostChange,
  onMiscCostChange,
  onAdditionalNotesChange,
}: ProjectCostsSectionProps) {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {t('project.form.additionalCosts')}
      </Typography>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={t('project.form.laborCost')}
            type="number"
            value={laborCost}
            onChange={(e) => onLaborCostChange(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            fullWidth
          />
          <TextField
            label={t('project.form.miscellaneousCost')}
            type="number"
            value={miscCost}
            onChange={(e) => onMiscCostChange(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            fullWidth
          />
        </Stack>
        <TextField
          label={t('project.form.additionalNotes')}
          placeholder={t('project.form.additionalNotesPlaceholder')}
          value={additionalNotes}
          onChange={(e) => onAdditionalNotesChange(e.target.value)}
          fullWidth
          multiline
          rows={2}
          variant="outlined"
        />
      </Stack>
    </Box>
  );
}
