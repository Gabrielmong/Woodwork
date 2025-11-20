import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { SheetGood, CreateSheetGoodInput } from '../../types';

interface SheetGoodFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (sheetGood: CreateSheetGoodInput) => void;
  editingSheetGood?: SheetGood | null;
}

export function SheetGoodForm({ open, onClose, onSubmit, editingSheetGood }: SheetGoodFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [thickness, setThickness] = useState('');
  const [price, setPrice] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setWidth('');
    setLength('');
    setThickness('');
    setPrice('');
    setMaterialType('');
    setTags([]);
    setCurrentTag('');
  };

  useEffect(() => {
    if (editingSheetGood) {
      setName(editingSheetGood.name);
      setDescription(editingSheetGood.description);
      setWidth(editingSheetGood.width.toString());
      setLength(editingSheetGood.length.toString());
      setThickness(editingSheetGood.thickness.toString());
      setPrice(editingSheetGood.price.toString());
      setMaterialType(editingSheetGood.materialType);
      setTags(editingSheetGood.tags);
    } else {
      resetForm();
    }
  }, [editingSheetGood, open]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    const sheetGoodData: CreateSheetGoodInput = {
      name,
      description,
      width: parseFloat(width),
      length: parseFloat(length),
      thickness: parseFloat(thickness),
      price: parseFloat(price),
      materialType,
      tags,
    };
    onSubmit(sheetGoodData);
    resetForm();
    onClose();
  };

  const isValid =
    name.trim() &&
    description.trim() &&
    width &&
    !isNaN(parseFloat(width)) &&
    length &&
    !isNaN(parseFloat(length)) &&
    thickness &&
    !isNaN(parseFloat(thickness)) &&
    price &&
    !isNaN(parseFloat(price)) &&
    materialType.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0px 20px 40px rgba(50, 50, 93, 0.15), 0px 12px 24px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 4,
          pt: 4,
          pb: 2,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'text.primary',
        }}
      >
        {editingSheetGood ? 'Edit Sheet Good' : 'Add New Sheet Good'}
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            placeholder="e.g., 4x8 Plywood Sheet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Description"
            placeholder="Describe the sheet good characteristics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            variant="outlined"
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Width (inches)"
              placeholder="e.g., 48"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              type="number"
              inputProps={{ step: '0.25' }}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Length (inches)"
              placeholder="e.g., 96"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              type="number"
              inputProps={{ step: '0.25' }}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Thickness (inches)"
              placeholder="e.g., 0.75"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              type="number"
              inputProps={{ step: '0.125' }}
              fullWidth
              required
              variant="outlined"
            />
          </Stack>
          <TextField
            label="Material Type"
            placeholder="e.g., Plywood, MDF, OSB, Particle Board"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Price ($)"
            placeholder="e.g., 45.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            inputProps={{ step: '0.01' }}
            fullWidth
            required
            variant="outlined"
          />
          <Box>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Add Tag"
                placeholder="e.g., Interior, Structural, Furniture"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                fullWidth
                variant="outlined"
              />
              <IconButton
                onClick={handleAddTag}
                disabled={!currentTag.trim()}
                sx={{
                  bgcolor: currentTag.trim() ? 'primary.main' : 'action.disabledBackground',
                  color: 'white',
                  '&:hover': {
                    bgcolor: currentTag.trim() ? 'primary.dark' : 'action.disabledBackground',
                  },
                  '&:disabled': {
                    color: 'action.disabled',
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Stack>
            {tags.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 2 }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{
                      bgcolor: 'background.default',
                      fontWeight: 500,
                      '& .MuiChip-deleteIcon': {
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 4, pt: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={!isValid}
          sx={{
            background: isValid ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : undefined,
            px: 4,
            '&:hover': {
              background: isValid ? 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)' : undefined,
            },
          }}
        >
          {editingSheetGood ? 'Update Sheet Good' : 'Add Sheet Good'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
