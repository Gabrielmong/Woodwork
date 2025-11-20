import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Stack,
  Grid,
  CardMedia,
  Link,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import LaunchIcon from '@mui/icons-material/Launch';
import type { Consumable } from '../../types/consumable';

interface ConsumableListProps {
  consumables: Consumable[];
  onEdit: (consumable: Consumable) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function ConsumableList({ consumables, onEdit, onDelete, onRestore }: ConsumableListProps) {
  return (
    <Grid container spacing={3}>
      {consumables.map((item) => (
        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.id}>
          <Card
            sx={{
              opacity: item.isDeleted ? 0.6 : 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {item.imageData && (
              <CardMedia
                component="img"
                height="200"
                image={item.imageData}
                alt={item.name}
                sx={{
                  objectFit: 'cover',
                  bgcolor: 'background.default',
                }}
              />
            )}
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Stack spacing={2.5}>
                {/* Header */}
                <Box>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {item.name}
                    </Typography>
                    {item.isDeleted && (
                      <Chip label="Deleted" size="small" color="error" sx={{ height: 24 }} />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>
                </Box>

                {/* Package Info */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'rgba(99, 91, 255, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Package Quantity
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {item.packageQuantity} items
                  </Typography>
                </Box>

                {/* Price Info */}
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: 'rgba(0, 217, 36, 0.05)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Package Price
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                      ${item.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: 'rgba(34, 197, 94, 0.08)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Unit Price
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                      ${item.unitPrice.toFixed(4)}/item
                    </Typography>
                  </Box>
                </Stack>

                {/* Store Link */}
                {item.storeLink && (
                  <Link
                    href={item.storeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      bgcolor: 'rgba(255, 153, 0, 0.05)',
                      borderRadius: 2,
                      textDecoration: 'none',
                      color: 'warning.main',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      '&:hover': {
                        bgcolor: 'rgba(255, 153, 0, 0.1)',
                      },
                    }}
                  >
                    View on Store
                    <LaunchIcon sx={{ fontSize: '1rem' }} />
                  </Link>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                    >
                      Categories:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {item.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: 'background.default',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
              {!item.isDeleted ? (
                <>
                  <IconButton
                    onClick={() => onEdit(item)}
                    aria-label="edit"
                    sx={{
                      color: 'primary.main',
                      bgcolor: 'rgba(99, 91, 255, 0.08)',
                      '&:hover': {
                        bgcolor: 'rgba(99, 91, 255, 0.15)',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(item.id)}
                    aria-label="delete"
                    sx={{
                      color: 'error.main',
                      bgcolor: 'rgba(223, 27, 65, 0.08)',
                      '&:hover': {
                        bgcolor: 'rgba(223, 27, 65, 0.15)',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <IconButton
                  onClick={() => onRestore(item.id)}
                  aria-label="restore"
                  sx={{
                    color: 'success.main',
                    bgcolor: 'rgba(0, 217, 36, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 217, 36, 0.15)',
                    },
                  }}
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
