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
import type { CreateProjectSheetGoodInput } from '../../types/project';
import type { SheetGood } from '../../types/sheetGood';

interface SheetGoodInputProps {
  projectSheetGood: CreateProjectSheetGoodInput;
  index: number;
  sheetGoodOptions: SheetGood[];
  onChange: (index: number, projectSheetGood: CreateProjectSheetGoodInput) => void;
  onRemove: (index: number) => void;
}

export default function SheetGoodInput({
  projectSheetGood,
  index,
  sheetGoodOptions,
  onChange,
  onRemove,
}: SheetGoodInputProps) {
  const { t } = useTranslation();

  const handleFieldChange = (field: keyof CreateProjectSheetGoodInput, value: string | number) => {
    onChange(index, { ...projectSheetGood, [field]: value });
  };

  const selectedSheetGood = sheetGoodOptions.find((sg) => sg.id === projectSheetGood.sheetGoodId);
  const totalCost = selectedSheetGood ? selectedSheetGood.price * projectSheetGood.quantity : 0;

  const handleSheetGoodChange = (sheetGoodId: string) => {
    onChange(index, { ...projectSheetGood, sheetGoodId });
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
              Sheet Good #{index + 1}
            </Typography>
            {selectedSheetGood && (
              <Typography variant="body2" color="text.secondary">
                {selectedSheetGood.name}
                {projectSheetGood.quantity > 0 && <> • Qty: {projectSheetGood.quantity}</>}
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
          {/* Sheet Good Selection */}
          <FormControl fullWidth required>
            <InputLabel>Sheet Good</InputLabel>
            <Select
              value={projectSheetGood.sheetGoodId || ''}
              label="Sheet Good"
              onChange={(e) => handleSheetGoodChange(e.target.value)}
            >
              {sheetGoodOptions.map((sheetGood) => (
                <MenuItem key={sheetGood.id} value={sheetGood.id}>
                  {sheetGood.name} ({sheetGood.width}"×{sheetGood.length}"×{sheetGood.thickness}") -
                  ₡{sheetGood.price.toFixed(2)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity */}
          <TextField
            label={t('boardInput.quantity')}
            type="number"
            value={projectSheetGood.quantity || ''}
            onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 0)}
            inputProps={{ step: '1', min: '1' }}
            fullWidth
            required
          />

          {/* Calculations Display */}
          {selectedSheetGood && projectSheetGood.quantity > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(99, 91, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light',
              }}
            >
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Material Type
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {selectedSheetGood.materialType}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Cost
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    ₡{totalCost.toFixed(2)}
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
