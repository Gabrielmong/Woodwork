import { useNavigate } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import type { Project } from '../../types/project';
import { calculateTotalBoardFootage } from '../../types/project';
import { useCurrency } from '../../utils/currency';
import { useTranslation } from 'react-i18next';

const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function ProjectList({ projects, onEdit, onDelete, onRestore }: ProjectListProps) {
  const navigate = useNavigate();
  const formatCurrency = useCurrency();
  const { t } = useTranslation();

  const calculateProjectCost = (project: Project) => {
    const boards = project.boards || [];
    const finishes = project.finishes || [];

    const materialCost = boards.reduce((total, board) => {
      const lumber = board.lumber;
      if (!lumber) return total;
      const lengthInInches = board.length * 33;
      const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
      const totalBF = boardFeet * board.quantity;
      return total + totalBF * lumber.costPerBoardFoot;
    }, 0);

    const finishCost = finishes.reduce((total, finish) => {
      return total + (finish?.price || 0);
    }, 0);

    return {
      materialCost,
      finishCost,
      totalCost: materialCost + finishCost + (project?.laborCost || 0) + (project?.miscCost || 0),
    };
  };

  return (
    <Grid container spacing={3}>
      {projects.map((project) => {
        const { materialCost, finishCost, totalCost } = calculateProjectCost(project);
        const totalBoardFootage = calculateTotalBoardFootage(project.boards);

        return (
          <Grid size={{ xs: 12, lg: 6 }} key={project.id}>
            <Card
              onClick={() => navigate(`/app/projects/${project.id}`)}
              sx={{
                opacity: project.isDeleted ? 0.6 : 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
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
                        {project.name}
                      </Typography>
                      {project.isDeleted && (
                        <Chip label="Deleted" size="small" color="error" sx={{ height: 24 }} />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {truncateText(project.description)}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Board Summary */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: 'block', mb: 1.5 }}
                    >
                      Materials ({totalBoardFootage.toFixed(2)} BF total):
                    </Typography>
                    <Stack spacing={1}>
                      {project.boards.map((board, idx) => {
                        const lumber = board.lumber;
                        const lengthInInches = board.length * 33;
                        const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
                        const totalBF = boardFeet * board.quantity;

                        return (
                          <Box
                            key={idx}
                            sx={{
                              p: 1.5,
                              bgcolor: 'rgba(99, 91, 255, 0.03)',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Stack spacing={0.5}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  {lumber?.name || 'Unknown Wood'}
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color="primary.main">
                                  {totalBF.toFixed(2)} BF
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {board.width}" × {board.thickness}" × {board.length}v (
                                {(lengthInInches / 12).toFixed(2)}') • Qty: {board.quantity}
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Finishes */}
                  {project.finishes && project.finishes.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                      >
                        Finishes:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {project?.finishes?.map((finish) => {
                          return (
                            <Chip
                              key={finish.id}
                              label={finish?.name || 'Unknown'}
                              size="small"
                              sx={{
                                bgcolor: 'background.default',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  {/* Cost Breakdown */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: 'block', mb: 1.5 }}
                    >
                      Cost Breakdown:
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('projects.materialsCost')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(materialCost)}
                        </Typography>
                      </Box>
                      {finishCost > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('projects.finishesCost')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(finishCost)}
                          </Typography>
                        </Box>
                      )}
                      {project.laborCost > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('projects.labor')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(project.laborCost)}
                          </Typography>
                        </Box>
                      )}
                      {project.miscCost > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('projects.misc')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(project.miscCost)}
                          </Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          p: 1.5,
                          bgcolor: 'rgba(0, 217, 36, 0.05)',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body1" fontWeight={700} color="text.primary">
                          {t('projects.totalCost')}
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="success.main">
                          {formatCurrency(totalCost)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                {!project.isDeleted ? (
                  <>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(project);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.id);
                      }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(project.id);
                    }}
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
        );
      })}
    </Grid>
  );
}
