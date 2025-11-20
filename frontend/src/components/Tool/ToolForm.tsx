import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  IconButton,
  Avatar,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import type { Tool, CreateToolInput } from '../../types/tool';
import { useTranslation } from 'react-i18next';

interface ToolFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tool: CreateToolInput) => void;
  editingTool?: Tool | null;
}

export function ToolForm({ open, onClose, onSubmit, editingTool }: ToolFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [functionField, setFunctionField] = useState('');
  const [price, setPrice] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imageData, setImageData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setFunctionField('');
    setPrice('');
    setSerialNumber('');
    setImageData('');
  };

  useEffect(() => {
    if (editingTool) {
      setName(editingTool.name);
      setDescription(editingTool.description);
      setFunctionField(editingTool.function);
      setPrice(editingTool.price.toString());
      setSerialNumber(editingTool.serialNumber || '');
      setImageData(editingTool.imageData || '');
    } else {
      resetForm();
    }
  }, [editingTool, open]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    const toolData: CreateToolInput = {
      name,
      description,
      function: functionField,
      price: parseFloat(price),
      serialNumber: serialNumber.trim() || undefined,
      imageData: imageData || undefined,
    };
    onSubmit(toolData);
    resetForm();
    onClose();
  };

  const isValid =
    name.trim() && description.trim() && functionField.trim() && price && !isNaN(parseFloat(price));

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
        {editingTool ? `${t('common.edit')} ${t('tools.title')}` : t('tools.add')}
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label={t('tools.name')}
            placeholder="e.g., DeWalt Table Saw"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label={t('tools.description')}
            placeholder="Describe the tool..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            variant="outlined"
          />
          <TextField
            label={t('tools.function')}
            placeholder="What is this tool used for?"
            value={functionField}
            onChange={(e) => setFunctionField(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label={t('tools.price')}
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            required
            type="number"
            variant="outlined"
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            label={t('tools.serialNumber')}
            placeholder="Optional serial number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            fullWidth
            variant="outlined"
          />

          {/* Image Upload */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
              Tool Image (Optional)
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {imageData ? (
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                <Avatar
                  src={imageData}
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 120,
                    border: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <BuildIcon sx={{ fontSize: 48 }} />
                </Avatar>
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
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.5,
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(99, 91, 255, 0.04)',
                  },
                }}
              >
                Upload Image
              </Button>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          variant="contained"
          sx={{
            background: isValid ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : undefined,
            px: 4,
            '&:hover': {
              background: isValid ? 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)' : undefined,
            },
          }}
        >
          {editingTool ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
