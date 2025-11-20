import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { CreateProjectConsumableInput } from '../../types/project';
import type { Consumable } from '../../types/consumable';
import { useCurrency } from '../../utils/currency';

interface ConsumableInputProps {
  projectConsumable: CreateProjectConsumableInput;
  index: number;
  consumableOptions: Consumable[];
  onChange: (index: number, projectConsumable: CreateProjectConsumableInput) => void;
  onRemove: (index: number) => void;
}

export default function ConsumableInput({
  projectConsumable,
  index,
  consumableOptions,
  onChange,
  onRemove,
}: ConsumableInputProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  const handleFieldChange = (field: keyof CreateProjectConsumableInput, value: string | number) => {
    onChange(index, { ...projectConsumable, [field]: value });
  };

  const selectedConsumable = consumableOptions.find((c) => c.id === projectConsumable.consumableId);

  // Calculate packages needed (rounded up to nearest whole package)
  const packagesNeeded = selectedConsumable
    ? Math.ceil(projectConsumable.quantity / selectedConsumable.packageQuantity)
    : 0;

  // Calculate total cost
  const totalCost = selectedConsumable ? packagesNeeded * selectedConsumable.price : 0;

  const handleConsumableChange = (consumableId: string) => {
    onChange(index, { ...projectConsumable, consumableId });
  };

  return (
    <Accordion
      defaultExpanded
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:before': {
          display: 'none',
        },
        boxShadow: 'none',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '8px 8px 0 0',
          '&:hover': {
            bgcolor: 'rgba(99, 91, 255, 0.03)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            pr: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {t('consumables.consumableInput.consumableNumber', { number: index + 1 })}
            </Typography>
            {selectedConsumable && (
              <Typography variant="body2" color="text.secondary">
                {selectedConsumable.name}
                {projectConsumable.quantity > 0 && (
                  <>
                    {' '}
                    • {projectConsumable.quantity} {t('consumables.consumableInput.itemsNeeded')}
                  </>
                )}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            size="small"
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: 'rgba(223, 27, 65, 0.08)',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, pt: 2 }}>
        <Stack spacing={2.5}>
          {/* Consumable Selection */}
          <FormControl fullWidth required>
            <InputLabel>{t('consumables.consumableInput.consumable')}</InputLabel>
            <Select
              value={projectConsumable.consumableId || ''}
              label={t('consumables.consumableInput.consumable')}
              onChange={(e) => handleConsumableChange(e.target.value)}
            >
              {consumableOptions.map((consumable) => (
                <MenuItem key={consumable.id} value={consumable.id}>
                  {consumable.name} ({formatCurrency(consumable.unitPrice)}/
                  {t('consumables.consumableInput.item')}, {consumable.packageQuantity}{' '}
                  {t('consumables.consumableInput.perPkg')})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity (number of items needed) */}
          <TextField
            label={t('consumables.consumableInput.quantityNeeded')}
            type="number"
            value={projectConsumable.quantity || ''}
            onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 0)}
            inputProps={{ step: '1', min: '1' }}
            fullWidth
            required
            helperText={t('consumables.consumableInput.quantityHelper')}
          />

          {/* Calculations Display */}
          {selectedConsumable && projectConsumable.quantity > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(99, 91, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light',
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('consumables.consumableInput.packageQuantity')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {selectedConsumable.packageQuantity}{' '}
                    {t('consumables.consumableInput.itemsPerPkg')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('consumables.consumableInput.unitPrice')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {selectedConsumable.unitPrice.toFixed(4)}/
                    {t('consumables.consumableInput.item')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('consumables.consumableInput.packagesNeeded')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    {packagesNeeded}{' '}
                    {t(
                      packagesNeeded !== 1
                        ? 'consumables.consumableInput.packages'
                        : 'consumables.consumableInput.package'
                    )}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {t('consumables.consumableInput.totalCost')}
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="success.main">
                    {formatCurrency(totalCost)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
