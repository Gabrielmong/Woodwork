import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  GET_PROJECT,
  DELETE_PROJECT,
  GET_FINISHES,
  GET_LUMBERS,
  GET_SHEET_GOODS,
  UPDATE_PROJECT,
} from '../../graphql/operations';
import {
  calculateTotalBoardFootage,
  VARA_TO_INCHES,
  type CreateProjectInput,
  type Project,
  type Board,
  ProjectStatus,
} from '../../types/project';
import { useCurrency } from '../../utils/currency';
import { ConfirmDialog } from '../General';
import { ProjectForm } from './ProjectForm';
import { ArrowDownward } from '@mui/icons-material';

export function ProjectDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const navigate = useNavigate();
  const formatCurrency = useCurrency();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    data: projectData,
    loading,
    error: projectError,
  } = useQuery(GET_PROJECT, {
    variables: { id: id || '' },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      navigate('/app/projects');
    },
  });

  const [updateProjectMutation] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECT, variables: { id: id || '' } }],
  });

  const { data: finishesData } = useQuery(GET_FINISHES);
  const { data: lumberData } = useQuery(GET_LUMBERS);
  const { data: sheetGoodsData } = useQuery(GET_SHEET_GOODS);

  const activeFinishes = useMemo(() => {
    return (finishesData?.finishes || []).filter((finish: any) => !finish.isDeleted);
  }, [finishesData]);

  const activeLumber = useMemo(() => {
    return (lumberData?.lumbers || []).filter((lumber: any) => !lumber.isDeleted);
  }, [lumberData]);

  const activeSheetGoods = useMemo(() => {
    return (sheetGoodsData?.sheetGoods || []).filter((sheetGood: any) => !sheetGood.isDeleted);
  }, [sheetGoodsData]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (projectError || !projectData?.project) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/app/projects')}
          sx={{ mb: 3 }}
        >
          {t('projectDetails.backToProjects')}
        </Button>
        <Typography variant="h4" color="text.secondary">
          {projectError
            ? `${t('projectDetails.error')} ${projectError.message}`
            : t('projectDetails.projectNotFound')}
        </Typography>
      </Box>
    );
  }

  const project = projectData.project;
  const boards = project?.boards || [];
  const finishes = project?.finishes || [];
  const projectSheetGoods = project?.projectSheetGoods || [];

  const calculateProjectCost = () => {
    const materialCost = boards.reduce((total: number, board: Board) => {
      const lumber = board.lumber;
      if (!lumber) return total;

      const lengthInInches = board.length * VARA_TO_INCHES;
      const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
      const totalBF = boardFeet * board.quantity;
      const cost = totalBF * lumber.costPerBoardFoot;

      return total + cost;
    }, 0);

    const finishCost = finishes.reduce(
      (total: number, finish: { id: string; name: string; price: number }) => {
        return total + (finish?.price || 0);
      },
      0
    );

    const sheetGoodCost = projectSheetGoods.reduce(
      (total: number, projectSheetGood: any) => {
        return total + ((projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity);
      },
      0
    );

    return {
      materialCost,
      finishCost,
      sheetGoodCost,
      totalCost: materialCost + finishCost + sheetGoodCost + (project?.laborCost || 0) + (project?.miscCost || 0),
    };
  };

  const { materialCost, finishCost, sheetGoodCost, totalCost } = calculateProjectCost();
  const totalBoardFootage = calculateTotalBoardFootage(project?.boards || []);

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProject({ variables: { id: project.id } });
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting project:', error);
      setDeleteConfirmOpen(false);
    }
  };

  const handleFormSubmit = async (projectData: CreateProjectInput) => {
    try {
      if (editingProject) {
        await updateProjectMutation({
          variables: {
            id: editingProject.id,
            input: projectData,
          },
        });
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleEdit = () => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setEditingProject(null);
    setFormOpen(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shared/${project.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      await updateProjectMutation({
        variables: {
          id: project.id,
          input: { status: newStatus },
        },
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Box>
      <Snackbar
        open={copySuccess}
        message={t('common.linkCopied')}
        autoHideDuration={4000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/app/projects')}
          sx={{ mb: 3 }}
        >
          {t('projectDetails.backToProjects')}
        </Button>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' },
              }}
            >
              {project.name}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
                mt: 1,
              }}
            >
              {project.description}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                label={t('common.status')}
                size="small"
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
            <IconButton
              onClick={handleShare}
              sx={{
                color: copySuccess ? 'success.main' : 'info.main',
                bgcolor: copySuccess ? 'rgba(46, 125, 50, 0.08)' : 'rgba(2, 136, 209, 0.08)',
                '&:hover': {
                  bgcolor: copySuccess ? 'rgba(46, 125, 50, 0.15)' : 'rgba(2, 136, 209, 0.15)',
                },
              }}
              title={copySuccess ? 'Link copied!' : 'Copy share link'}
            >
              {copySuccess ? <ContentCopyIcon /> : <ShareIcon />}
            </IconButton>
            <IconButton
              onClick={handleEdit}
              sx={{
                color: 'primary.main',
                bgcolor: 'rgba(99, 91, 255, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(99, 91, 255, 0.15)',
                },
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              sx={{
                color: 'error.main',
                bgcolor: 'rgba(223, 27, 65, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(223, 27, 65, 0.15)',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Cost Summary Card */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {t('projectDetails.projectSummary')}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('projectDetails.totalBoardFeet')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalBoardFootage.toFixed(2)} BF
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('projectDetails.boardTypes')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {project.boards.length}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('projectDetails.totalCost')}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatCurrency(totalCost)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Board Details */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {t('projectDetails.materials')} ({totalBoardFootage.toFixed(2)}{' '}
            {t('projectDetails.bfTotal')})
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
              <Stack spacing={2}>
                {project.boards.map((board: any, idx: number) => {
                  const lumber = board.lumber;
                  const lengthInInches = board.length * VARA_TO_INCHES;
                  const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
                  const totalBF = boardFeet * board.quantity;
                  const cost = lumber ? totalBF * lumber.costPerBoardFoot : 0;

                  return (
                    <Paper
                      key={idx}
                      sx={{
                        p: 2.5,
                        bgcolor: 'rgba(99, 91, 255, 0.03)',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
                            >
                              {lumber?.name || t('projectDetails.unknownWood')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {board.width}" × {board.thickness}" × {board.length} varas (
                              {(lengthInInches / 12).toFixed(2)}')
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('projectDetails.quantity')}: {board.quantity}{' '}
                              {t('projectDetails.boards')}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                              {t('projectDetails.boardFeet')}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: 'primary.main' }}
                            >
                              {totalBF.toFixed(2)} BF
                            </Typography>
                          </Box>
                        </Box>

                        <Divider />

                        <Box>
                          <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {t('projectDetails.costPerBF')}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {lumber ? formatCurrency(lumber.costPerBoardFoot) : 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {t('projectDetails.jankaRating')}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {lumber?.jankaRating?.toLocaleString() || 'N/A'} lbf
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'right' }}>
                              <Typography variant="caption" color="text.secondary">
                                {t('projectDetails.materialCost')}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: 'success.main' }}
                              >
                                {formatCurrency(cost)}
                              </Typography>
                            </Box>
                          </Stack>

                          {lumber && lumber?.tags?.length > 0 && (
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}
                              >
                                {t('projectDetails.goodFor')}
                              </Typography>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                {lumber.tags.map((tag: string, tagIdx: number) => (
                                  <Chip
                                    key={tagIdx}
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
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Finishes */}
      {project.finishes && project.finishes.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('projectDetails.finishes')}
            </Typography>
            <Stack spacing={2}>
              {project.finishes.map((finish: any) => {
                if (!finish) return null;

                return (
                  <Paper
                    key={finish.id}
                    sx={{
                      p: 2.5,
                      bgcolor: 'rgba(0, 217, 36, 0.03)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {finish.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {finish.description}
                        </Typography>
                        {finish.tags && finish.tags.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {finish.tags.map((tag: string, idx: number) => (
                              <Chip
                                key={idx}
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
                        )}
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('common.price')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(finish.price)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Sheet Goods */}
      {project.projectSheetGoods && project.projectSheetGoods.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Sheet Goods
            </Typography>
            <Stack spacing={2}>
              {project.projectSheetGoods.map((projectSheetGood: any) => {
                const sheetGood = projectSheetGood.sheetGood;
                if (!sheetGood) return null;

                return (
                  <Paper
                    key={projectSheetGood.id}
                    sx={{
                      p: 2.5,
                      bgcolor: 'rgba(99, 91, 255, 0.03)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {sheetGood.name} <Chip label={`Qty: ${projectSheetGood.quantity}`} size="small" sx={{ ml: 1 }} />
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {sheetGood.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          Dimensions: {sheetGood.width}" × {sheetGood.length}" × {sheetGood.thickness}" • Material: {sheetGood.materialType}
                        </Typography>
                        {sheetGood.tags && sheetGood.tags.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {sheetGood.tags.map((tag: string, idx: number) => (
                              <Chip
                                key={idx}
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
                        )}
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          Unit Price
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {formatCurrency(sheetGood.price)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Cost
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(sheetGood.price * projectSheetGood.quantity)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {t('projectDetails.costBreakdown')}
          </Typography>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="text.secondary">
                {t('projectDetails.materials')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(materialCost)}
              </Typography>
            </Box>
            {finishCost > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  {t('projectDetails.finishes')}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(finishCost)}
                </Typography>
              </Box>
            )}
            {sheetGoodCost > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  Sheet Goods
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(sheetGoodCost)}
                </Typography>
              </Box>
            )}
            {project.laborCost > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  {t('projectDetails.labor')}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(project.laborCost)}
                </Typography>
              </Box>
            )}
            {project.miscCost > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  {t('projectDetails.miscellaneous')}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(project.miscCost)}
                </Typography>
              </Box>
            )}
            {project.additionalNotes && (
              <Box sx={{ mt: 1, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  {t('common.notes')}:
                </Typography>
                <Typography variant="body2">{project.additionalNotes}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'rgba(0, 217, 36, 0.08)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {t('projectDetails.totalCost')}
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(totalCost)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('projectDetails.deleteProject')}
        message={t('projectDetails.deleteProjectConfirm', { name: project.name })}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <ProjectForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingProject={editingProject}
        lumberOptions={activeLumber}
        finishOptions={activeFinishes}
        sheetGoodOptions={activeSheetGoods}
      />
    </Box>
  );
}
