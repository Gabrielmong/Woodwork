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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import type { SheetGood } from '../../types/sheetGood';

interface SheetGoodListProps {
  sheetGoods: SheetGood[];
  onEdit: (sheetGood: SheetGood) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function SheetGoodList({ sheetGoods, onEdit, onDelete, onRestore }: SheetGoodListProps) {
  return (
    <Grid container spacing={3}>
      {sheetGoods.map((item) => (
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

                {/* Dimensions */}
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
                    Dimensions
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {item.width}" x {item.length}" x {item.thickness}"
                  </Typography>
                </Box>

                {/* Material Type */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'rgba(52, 211, 153, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Material
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {item.materialType}
                  </Typography>
                </Box>

                {/* Price */}
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
                    Price
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ₡{item.price.toFixed(2)}
                  </Typography>
                </Box>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                    >
                      Good for:
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
