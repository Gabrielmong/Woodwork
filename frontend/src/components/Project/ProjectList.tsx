import React from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type { Project } from '../../types/project';
import { calculateTotalBoardFootage, ProjectStatus } from '../../types/project';
import { useCurrency } from '../../utils/currency';
import { useTranslation } from 'react-i18next';
import { ArrowDownward } from '@mui/icons-material';

const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

export function ProjectList({
  projects,
  onEdit,
  onDelete,
  onRestore,
  onStatusChange,
}: ProjectListProps) {
  const navigate = useNavigate();
  const formatCurrency = useCurrency();
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/shared/${projectId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(projectId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculateProjectCost = (project: Project) => {
    const boards = project.boards || [];
    const finishes = project.finishes || [];
    const projectSheetGoods = project.projectSheetGoods || [];

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

    const sheetGoodCost = projectSheetGoods.reduce((total, projectSheetGood) => {
      return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
    }, 0);

    return {
      materialCost,
      finishCost,
      sheetGoodCost,
      totalCost:
        materialCost +
        finishCost +
        sheetGoodCost +
        (project?.laborCost || 0) +
        (project?.miscCost || 0),
    };
  };

  return (
    <Grid container spacing={3}>
      <Snackbar
        open={copiedId !== null}
        message={t('common.linkCopied')}
        autoHideDuration={4000}
        onClose={() => setCopiedId(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      {projects.map((project) => {
        const { materialCost, finishCost, sheetGoodCost, totalCost } =
          calculateProjectCost(project);
        const totalBoardFootage = calculateTotalBoardFootage(project.boards || []);

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
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
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
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {truncateText(project.description)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {!project.isDeleted && onStatusChange ? (
                          <FormControl size="small" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={project.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                onStatusChange(project.id, e.target.value as ProjectStatus);
                              }}
                              size="small"
                              sx={{
                                minWidth: 130,
                                height: 32,
                                '& .MuiSelect-select': {
                                  py: 0.5,
                                  fontSize: '0.875rem',
                                },
                              }}
                            >
                              <MenuItem value={ProjectStatus.PLANNED}>
                                <Chip
                                  label={t('project.status.planned')}
                                  size="small"
                                  color="default"
                                  sx={{ height: 22, fontSize: '0.75rem' }}
                                />
                              </MenuItem>
                              <MenuItem value={ProjectStatus.IN_PROGRESS}>
                                <Chip
                                  label={t('project.status.inProgress')}
                                  size="small"
                                  color="info"
                                  sx={{ height: 22, fontSize: '0.75rem' }}
                                />
                              </MenuItem>
                              <MenuItem value={ProjectStatus.FINISHING}>
                                <Chip
                                  label={t('project.status.finishing')}
                                  size="small"
                                  color="warning"
                                  sx={{ height: 22, fontSize: '0.75rem' }}
                                />
                              </MenuItem>
                              <MenuItem value={ProjectStatus.COMPLETED}>
                                <Chip
                                  label={t('project.status.completed')}
                                  size="small"
                                  color="success"
                                  sx={{ height: 22, fontSize: '0.75rem' }}
                                />
                              </MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          project.isDeleted && (
                            <Chip label="Deleted" size="small" color="error" sx={{ height: 24 }} />
                          )
                        )}
                      </Stack>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Board Summary */}
                  {project.boards && project.boards.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Boards ({totalBoardFootage.toFixed(2)} BF total):
                      </Typography>
                      <Accordion elevation={0} sx={{ bgcolor: 'background.default' }}>
                        <AccordionSummary
                          expandIcon={<ArrowDownward />}
                          aria-controls="boards-content"
                          id="boards-header"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            View Boards
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          <Stack spacing={1}>
                            {project.boards.map((board, idx) => {
                              const lumber = board.lumber;
                              const lengthInInches = board.length * 33;
                              const boardFeet =
                                (board.width * board.thickness * lengthInInches) / 144;
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
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color="text.primary"
                                      >
                                        {lumber?.name || 'Unknown Wood'}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        color="primary.main"
                                      >
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
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  )}

                  {project.projectSheetGoods && project.projectSheetGoods.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                      >
                        Sheet Goods:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {project?.projectSheetGoods?.map((projectSheetGood) => {
                          return (
                            <Chip
                              key={projectSheetGood.id}
                              label={`${projectSheetGood.sheetGood?.name || 'Unknown'} (${projectSheetGood.quantity})`}
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
                      {sheetGoodCost > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Sheet Goods
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(sheetGoodCost)}
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
                      onClick={(e) => handleShare(e, project.id)}
                      aria-label="share"
                      sx={{
                        color: copiedId === project.id ? 'success.main' : 'info.main',
                        bgcolor:
                          copiedId === project.id
                            ? 'rgba(46, 125, 50, 0.08)'
                            : 'rgba(2, 136, 209, 0.08)',
                        '&:hover': {
                          bgcolor:
                            copiedId === project.id
                              ? 'rgba(46, 125, 50, 0.15)'
                              : 'rgba(2, 136, 209, 0.15)',
                        },
                      }}
                      title={copiedId === project.id ? 'Link copied!' : 'Copy share link'}
                    >
                      {copiedId === project.id ? (
                        <ContentCopyIcon fontSize="small" />
                      ) : (
                        <ShareIcon fontSize="small" />
                      )}
                    </IconButton>
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
