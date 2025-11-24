import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Typography,
  IconButton,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Finish } from '../../../types/finish';
import type { CreateProjectFinishInput } from '../../../types/project';
import { useCurrency } from '../../../utils/currency';

interface ProjectFinishesFormSectionProps {
  projectFinishes: CreateProjectFinishInput[];
  finishOptions: Finish[];
  onProjectFinishesChange: (value: CreateProjectFinishInput[]) => void;
}

export function ProjectFinishesFormSection({
  projectFinishes,
  finishOptions,
  onProjectFinishesChange,
}: ProjectFinishesFormSectionProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  const handleAddFinish = () => {
    const availableFinish = finishOptions.find(
      (f) => !projectFinishes.some((pf) => pf.finishId === f.id)
    );
    if (availableFinish) {
      onProjectFinishesChange([
        ...projectFinishes,
        { finishId: availableFinish.id, quantity: 1, percentageUsed: 100 },
      ]);
    }
  };

  const handleRemoveFinish = (index: number) => {
    onProjectFinishesChange(projectFinishes.filter((_, i) => i !== index));
  };

  const handleFinishChange = (index: number, finishId: string) => {
    const updated = [...projectFinishes];
    updated[index] = { ...updated[index], finishId };
    onProjectFinishesChange(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...projectFinishes];
    updated[index] = { ...updated[index], quantity: Math.max(1, quantity) };
    onProjectFinishesChange(updated);
  };

  const handlePercentageChange = (index: number, percentage: number) => {
    const updated = [...projectFinishes];
    updated[index] = { ...updated[index], percentageUsed: percentage };
    onProjectFinishesChange(updated);
  };

  // Filter available finishes (not already selected)
  const getAvailableFinishes = (currentFinishId?: string) => {
    return finishOptions.filter(
      (f) =>
        f.id === currentFinishId ||
        !projectFinishes.some((pf) => pf.finishId === f.id)
    );
  };

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('project.form.finishesSectionTitle')}
          </Typography>
          <Button
            onClick={handleAddFinish}
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            disabled={projectFinishes.length >= finishOptions.length}
          >
            {t('finishes.add')}
          </Button>
        </Box>

        {projectFinishes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
            {t('project.form.noFinishesAdded') || 'No finishes added yet. Click "Add Finish" to get started.'}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {projectFinishes.map((projectFinish, index) => {
              const finish = finishOptions.find((f) => f.id === projectFinish.finishId);
              const cost = finish ? (finish.price * projectFinish.percentageUsed * projectFinish.quantity) / 100 : 0;

              return (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <FormControl fullWidth>
                      <InputLabel>{t('finishes.name')}</InputLabel>
                      <Select
                        value={projectFinish.finishId}
                        onChange={(e) => handleFinishChange(index, e.target.value)}
                        label={t('finishes.name')}
                      >
                        {getAvailableFinishes(projectFinish.finishId).map((finish) => (
                          <MenuItem key={finish.id} value={finish.id}>
                            {finish.name} - {formatCurrency(finish.price)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <IconButton
                      onClick={() => handleRemoveFinish(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('common.quantity')}
                      value={projectFinish.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1 }}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('finishes.percentageUsed')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {projectFinish.percentageUsed}%
                      </Typography>
                    </Box>
                    <Slider
                      value={projectFinish.percentageUsed}
                      onChange={(_, value) => handlePercentageChange(index, value as number)}
                      min={1}
                      max={100}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('finishes.percentageHelper')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {formatCurrency(cost)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
      <Divider />
    </>
  );
}
