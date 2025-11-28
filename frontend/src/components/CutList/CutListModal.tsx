import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CutList, CreateCutListInput, UpdateCutListInput } from '../../types';

interface CutListModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateCutListInput | UpdateCutListInput) => Promise<void>;
  editingCut?: CutList | null;
  projectId: string;
}

export function CutListModal({ open, onClose, onSave, editingCut, projectId }: CutListModalProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState<number>(0);
  const [thickness, setThickness] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCut) {
      setWidth(editingCut.width);
      setThickness(editingCut.thickness);
      setLength(editingCut.length);
      setQuantity(editingCut.quantity);
      setDescription(editingCut.description || '');
    } else {
      setWidth(0);
      setThickness(0);
      setLength(0);
      setQuantity(1);
      setDescription('');
    }
  }, [editingCut, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const input = editingCut
        ? { width, thickness, length, quantity, description }
        : { projectId, width, thickness, length, quantity, description };

      await onSave(input);
      onClose();
    } catch (error) {
      console.error('Error saving cut list:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = width > 0 && thickness > 0 && length > 0 && quantity > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingCut ? t('cutList.editCut') : t('cutList.addCut')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('cutList.width')}
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.25 }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('cutList.thickness')}
                value={thickness}
                onChange={(e) => setThickness(parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.25 }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('cutList.length')}
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.25 }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('cutList.quantity')}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('cutList.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('cutList.descriptionPlaceholder')}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid || loading}>
          {editingCut ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
