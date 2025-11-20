import { useState, useEffect, useRef, useMemo } from 'react';
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
import type { Consumable, CreateConsumableInput } from '../../types/consumable';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../utils/currency';

interface ConsumableFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (consumable: CreateConsumableInput) => void;
  editingConsumable?: Consumable | null;
}

export function ConsumableForm({
  open,
  onClose,
  onSubmit,
  editingConsumable,
}: ConsumableFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [packageQuantity, setPackageQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [storeLink, setStoreLink] = useState('');
  const [imageData, setImageData] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  // Calculate unit price
  const unitPrice = useMemo(() => {
    const qty = parseFloat(packageQuantity);
    const prc = parseFloat(price);
    if (!isNaN(qty) && !isNaN(prc) && qty > 0) {
      return prc / qty;
    }
    return 0;
  }, [packageQuantity, price]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPackageQuantity('');
    setPrice('');
    setStoreLink('');
    setImageData('');
    setTags([]);
    setCurrentTag('');
  };

  useEffect(() => {
    if (editingConsumable) {
      setName(editingConsumable.name);
      setDescription(editingConsumable.description);
      setPackageQuantity(editingConsumable.packageQuantity.toString());
      setPrice(editingConsumable.price.toString());
      setStoreLink(editingConsumable.storeLink || '');
      setImageData(editingConsumable.imageData || '');
      setTags(editingConsumable.tags);
    } else {
      resetForm();
    }
  }, [editingConsumable, open]);

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
    const consumableData: CreateConsumableInput = {
      name,
      description,
      packageQuantity: parseInt(packageQuantity),
      price: parseFloat(price),
      tags,
      storeLink: storeLink.trim() || undefined,
      imageData: imageData || undefined,
    };
    onSubmit(consumableData);
    resetForm();
    onClose();
  };

  const isValid =
    name.trim() &&
    description.trim() &&
    packageQuantity &&
    !isNaN(parseInt(packageQuantity)) &&
    parseInt(packageQuantity) > 0 &&
    price &&
    !isNaN(parseFloat(price)) &&
    parseFloat(price) > 0;

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
        {editingConsumable
          ? t('consumables.consumableForm.editConsumable')
          : t('consumables.consumableForm.addNewConsumable')}
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label={t('consumables.consumableForm.name')}
            placeholder={t('consumables.consumableForm.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label={t('consumables.consumableForm.description')}
            placeholder={t('consumables.consumableForm.descriptionPlaceholder')}
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
              label={t('consumables.consumableForm.packageQuantity')}
              placeholder={t('consumables.consumableForm.packageQuantityPlaceholder')}
              value={packageQuantity}
              onChange={(e) => setPackageQuantity(e.target.value)}
              type="number"
              inputProps={{ step: '1', min: '1' }}
              fullWidth
              required
              variant="outlined"
              helperText={t('consumables.consumableForm.packageQuantityHelper')}
            />
            <TextField
              label={t('consumables.consumableForm.price')}
              placeholder={t('consumables.consumableForm.pricePlaceholder')}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              inputProps={{ step: '0.01', min: '0.01' }}
              fullWidth
              required
              variant="outlined"
              helperText={t('consumables.consumableForm.priceHelper')}
            />
          </Stack>

          {/* Unit Price Display */}
          {unitPrice > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(34, 197, 94, 0.05)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'success.light',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {t('consumables.consumableForm.unitPricePerItem')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(unitPrice)}
                </Typography>
              </Stack>
            </Box>
          )}

          <TextField
            label={t('consumables.consumableForm.storeLink')}
            placeholder={t('consumables.consumableForm.storeLinkPlaceholder')}
            value={storeLink}
            onChange={(e) => setStoreLink(e.target.value)}
            fullWidth
            variant="outlined"
          />

          {/* Image Upload Section */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t('consumables.consumableForm.productImageOptional')}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {imageData ? (
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={imageData}
                    alt={t('consumables.consumableForm.productImagePreviewAlt')}
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
                    {imageData
                      ? t('consumables.consumableForm.changeImage')
                      : t('consumables.consumableForm.uploadImage')}
                  </Button>
                </label>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {t('consumables.consumableForm.imageUploadInstructions')}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Box>
            <Stack direction="row" spacing={1}>
              <TextField
                label={t('consumables.consumableForm.addTag')}
                placeholder={t('consumables.consumableForm.addTagPlaceholder')}
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
          {t('common.cancel')}
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
          {editingConsumable
            ? t('consumables.consumableForm.updateConsumable')
            : t('consumables.consumableForm.addConsumable')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
