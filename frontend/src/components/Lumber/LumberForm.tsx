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
import type { Lumber, CreateLumberInput } from '../../types/lumber';

interface LumberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (lumber: CreateLumberInput) => void;
  editingLumber?: Lumber | null;
}

export default function LumberForm({ open, onClose, onSubmit, editingLumber }: LumberFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [jankaRating, setJankaRating] = useState('');
  const [costPerBoardFoot, setCostPerBoardFoot] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setJankaRating('');
    setCostPerBoardFoot('');
    setTags([]);
    setCurrentTag('');
  };

  useEffect(() => {
    if (editingLumber) {
      setName(editingLumber.name);
      setDescription(editingLumber.description);
      setJankaRating(editingLumber.jankaRating.toString());
      setCostPerBoardFoot(editingLumber.costPerBoardFoot.toString());
      setTags(editingLumber.tags);
    } else {
      resetForm();
    }
  }, [editingLumber, open]);

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
    const lumberData: CreateLumberInput = {
      name,
      description,
      jankaRating: parseFloat(jankaRating),
      costPerBoardFoot: parseFloat(costPerBoardFoot),
      tags,
    };
    onSubmit(lumberData);
    resetForm();
    onClose();
  };

  const isValid =
    name.trim() &&
    description.trim() &&
    jankaRating &&
    !isNaN(parseFloat(jankaRating)) &&
    costPerBoardFoot &&
    !isNaN(parseFloat(costPerBoardFoot));

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
        {editingLumber ? 'Edit Lumber' : 'Add New Lumber'}
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            placeholder="e.g., Red Oak"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Description"
            placeholder="Describe the wood characteristics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            variant="outlined"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Janka Rating (lbf)"
              placeholder="e.g., 1290"
              value={jankaRating}
              onChange={(e) => setJankaRating(e.target.value)}
              type="number"
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Cost per Board Foot (₡)"
              placeholder="e.g., 4.50"
              value={costPerBoardFoot}
              onChange={(e) => setCostPerBoardFoot(e.target.value)}
              type="number"
              inputProps={{ step: '0.01' }}
              fullWidth
              required
              variant="outlined"
            />
          </Stack>
          <Box>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Add Tag"
                placeholder="e.g., Flooring, Cabinets"
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
          {editingLumber ? 'Update Lumber' : 'Add Lumber'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
