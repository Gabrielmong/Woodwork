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
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CreateBoardInput } from '../../types/project';
import type { Lumber } from '../../types/lumber';
import { calculateBoardFootage } from '../../types/project';

interface BoardInputProps {
  board: CreateBoardInput;
  index: number;
  lumberOptions: Lumber[];
  onChange: (index: number, board: CreateBoardInput) => void;
  onRemove: (index: number) => void;
}

export default function BoardInput({
  board,
  index,
  lumberOptions,
  onChange,
  onRemove,
}: BoardInputProps) {
  const { t } = useTranslation();
  const handleFieldChange = (field: keyof CreateBoardInput, value: string | number) => {
    onChange(index, { ...board, [field]: value });
  };

  const selectedLumber = lumberOptions.find((l) => l.id === board.lumberId);
  const boardFootage = calculateBoardFootage({
    id: '',
    ...board,
    boardFeet: 0,
  });
  const materialCost = selectedLumber ? boardFootage * selectedLumber.costPerBoardFoot : 0;

  const handleBoardLumberChange = (lumberId: string) => {
    onChange(index, { ...board, lumberId });
  };

  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2.5}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {t('boardInput.board')} #{index + 1}
          </Typography>
          <IconButton
            onClick={() => onRemove(index)}
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

        <Divider />

        {/* Lumber Selection */}
        <FormControl fullWidth required>
          <InputLabel>{t('boardInput.woodSpecies')}</InputLabel>
          <Select
            value={board.lumberId || ''}
            label={t('boardInput.woodSpecies')}
            onChange={(e) => handleBoardLumberChange(e.target.value)}
          >
            {lumberOptions.map((lumber) => (
              <MenuItem key={lumber.id} value={lumber.id}>
                {lumber.name} - ₡{lumber.costPerBoardFoot.toFixed(2)}/BF
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Dimensions */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={t('boardInput.widthInches')}
            type="number"
            value={board.width || ''}
            onChange={(e) => handleFieldChange('width', parseFloat(e.target.value) || 0)}
            inputProps={{ step: '0.125', min: '0' }}
            fullWidth
            required
          />
          <TextField
            label={t('boardInput.thicknessInches')}
            type="number"
            value={board.thickness || ''}
            onChange={(e) => handleFieldChange('thickness', parseFloat(e.target.value) || 0)}
            inputProps={{ step: '0.125', min: '0' }}
            fullWidth
            required
          />
          <TextField
            label={t('boardInput.lengthVaras')}
            type="number"
            value={board.length || ''}
            onChange={(e) => handleFieldChange('length', parseFloat(e.target.value) || 0)}
            inputProps={{ step: '0.25', min: '0' }}
            fullWidth
            required
            helperText={t('boardInput.varaHelper')}
          />
        </Stack>

        {/* Quantity */}
        <TextField
          label={t('boardInput.quantity')}
          type="number"
          value={board.quantity || ''}
          onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 0)}
          inputProps={{ step: '1', min: '1' }}
          fullWidth
          required
        />

        {/* Calculations Display */}
        {board.width && board.thickness && board.length && board.quantity && selectedLumber && (
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
                  {t('boardInput.boardFeetTotal')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {boardFootage.toFixed(2)} BF
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('boardInput.materialCost')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  ₡{materialCost.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
