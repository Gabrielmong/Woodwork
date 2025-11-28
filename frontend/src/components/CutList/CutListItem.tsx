import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  Box,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { CutList } from '../../types';

interface CutListItemProps {
  cut: CutList;
  measurementUnit: string;
  onToggleComplete: (id: string) => void;
  onEdit: (cut: CutList) => void;
  onDelete: (id: string) => void;
}

export function CutListItem({
  cut,
  measurementUnit,
  onToggleComplete,
  onEdit,
  onDelete,
}: CutListItemProps) {
  const { t } = useTranslation();

  const getUnitDisplay = () => {
    switch (measurementUnit) {
      case 'inches':
        return '"';
      case 'cm':
        return 'cm';
      case 'mm':
        return 'mm';
      default:
        return '"';
    }
  };

  const unit = getUnitDisplay();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2 },
      }}
      style={{ marginBottom: '16px' }}
    >
      <Card
        sx={{
          opacity: cut.isCompleted ? 0.6 : 1,
          transition: 'opacity 0.3s',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="flex-start">
            <Checkbox
              checked={cut.isCompleted}
              onChange={() => onToggleComplete(cut.id)}
              sx={{ mt: -1 }}
            />
            <Box flex={1} ml={1}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: cut.isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {cut.width}
                      {unit} × {cut.thickness}
                      {unit} × {cut.length}
                      {unit}
                    </Typography>
                    <Chip label={`${t('cutList.qty')}: ${cut.quantity}`} size="small" />
                    {cut.isCompleted && (
                      <Chip label={t('cutList.completed')} color="success" size="small" />
                    )}
                  </Box>
                  {cut.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        textDecoration: cut.isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {cut.description}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <IconButton size="small" onClick={() => onEdit(cut)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(cut.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
