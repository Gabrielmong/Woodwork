import { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Finish, CreateFinishInput } from '../../types';

interface FinishFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (finish: CreateFinishInput) => void;
  editingFinish?: Finish | null;
}

export function FinishForm({ open, onClose, onSubmit, editingFinish }: FinishFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [storeLink, setStoreLink] = useState('');
  const [imageData, setImageData] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStoreLink('');
    setImageData('');
    setTags([]);
    setCurrentTag('');
  };

  useEffect(() => {
    if (editingFinish) {
      setName(editingFinish.name);
      setDescription(editingFinish.description);
      setPrice(editingFinish.price.toString());
      setStoreLink(editingFinish.storeLink || '');
      setImageData(editingFinish.imageData || '');
      setTags(editingFinish.tags);
    } else {
      resetForm();
    }
  }, [editingFinish, open]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageData('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    const finishData: CreateFinishInput = {
      name,
      description,
      price: parseFloat(price),
      tags,
      storeLink: storeLink.trim() || undefined,
      imageData: imageData || undefined,
    };
    onSubmit(finishData);
    resetForm();
    onClose();
  };

  const isValid = name.trim() && description.trim() && price && !isNaN(parseFloat(price));

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
        {editingFinish ? 'Edit Wood Finish' : 'Add New Wood Finish'}
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            placeholder="e.g., Minwax Polyurethane"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Description"
            placeholder="Describe the finish characteristics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            variant="outlined"
          />
          <TextField
            label="Price ($)"
            placeholder="e.g., 24.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            inputProps={{ step: '0.01' }}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Store Link (optional)"
            placeholder="https://www.store.com/..."
            value={storeLink}
            onChange={(e) => setStoreLink(e.target.value)}
            fullWidth
            variant="outlined"
          />

          {/* Image Upload Section */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              Product Image (optional)
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {imageData ? (
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={imageData}
                    alt="Product preview"
                    variant="rounded"
                    sx={{ width: 120, height: 120 }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'background.default',
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                </Avatar>
              )}
              <Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      },
                    }}
                  >
                    {imageData ? 'Change Image' : 'Upload Image'}
                  </Button>
                </label>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Max size: 5MB. Formats: JPG, PNG, GIF
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Box>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Add Tag"
                placeholder="e.g., Interior, Exterior, Water-based"
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
          {editingFinish ? 'Update Finish' : 'Add Finish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
