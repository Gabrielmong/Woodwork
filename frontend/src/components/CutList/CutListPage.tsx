import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { AnimatePresence } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useTranslation } from 'react-i18next';
import type { CutList, CreateCutListInput, UpdateCutListInput } from '../../types';
import { CutListModal } from './CutListModal';
import { CutListItem } from './CutListItem';
import {
  GET_CUT_LISTS,
  CREATE_CUT_LIST,
  UPDATE_CUT_LIST,
  DELETE_CUT_LIST,
  TOGGLE_CUT_LIST_COMPLETE,
  GET_PROJECT,
  UPDATE_PROJECT,
} from '../../graphql';

type FilterType = 'all' | 'pending' | 'completed';
type MeasurementUnit = 'inches' | 'cm' | 'mm';

export function CutListPage() {
  const { t } = useTranslation();
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCut, setEditingCut] = useState<CutList | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('inches');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cutToDelete, setCutToDelete] = useState<string | null>(null);

  // Fetch project details and use its measurement unit as default
  const { data: projectData } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
    onCompleted: (data) => {
      if (data?.project?.measurementUnit) {
        setMeasurementUnit(data.project.measurementUnit as MeasurementUnit);
      }
    },
  });

  // Fetch cut lists
  const { data, loading, error } = useQuery(GET_CUT_LISTS, {
    variables: { projectId },
    skip: !projectId,
  });

  // Mutations
  const [createCutList] = useMutation(CREATE_CUT_LIST, {
    refetchQueries: [{ query: GET_CUT_LISTS, variables: { projectId } }],
  });

  const [updateCutList] = useMutation(UPDATE_CUT_LIST, {
    refetchQueries: [{ query: GET_CUT_LISTS, variables: { projectId } }],
  });

  const [deleteCutList] = useMutation(DELETE_CUT_LIST, {
    refetchQueries: [{ query: GET_CUT_LISTS, variables: { projectId } }],
  });

  const [toggleComplete] = useMutation(TOGGLE_CUT_LIST_COMPLETE, {
    refetchQueries: [{ query: GET_CUT_LISTS, variables: { projectId } }],
  });

  const [updateProject] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECT, variables: { id: projectId } }],
  });

  // Filter and sort cut lists
  const filteredCuts = useMemo(() => {
    if (!data?.cutLists) return [];

    let cuts = [...data.cutLists];

    // Apply filter
    if (filter === 'pending') {
      cuts = cuts.filter((cut: CutList) => !cut.isCompleted);
    } else if (filter === 'completed') {
      cuts = cuts.filter((cut: CutList) => cut.isCompleted);
    }

    // Sort: incomplete first, then by creation date
    cuts.sort((a: CutList, b: CutList) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return cuts;
  }, [data, filter]);

  const handleOpenModal = () => {
    setEditingCut(null);
    setModalOpen(true);
  };

  const handleEditCut = (cut: CutList) => {
    setEditingCut(cut);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCut(null);
  };

  const handleSaveCut = async (input: CreateCutListInput | UpdateCutListInput) => {
    if (editingCut) {
      await updateCutList({
        variables: { id: editingCut.id, input },
      });
    } else {
      await createCutList({
        variables: { input },
      });
    }
  };

  const handleDeleteCut = (id: string) => {
    setCutToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (cutToDelete) {
      await deleteCutList({ variables: { id: cutToDelete } });
      setDeleteDialogOpen(false);
      setCutToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setCutToDelete(null);
  };

  const handleToggleComplete = async (id: string) => {
    await toggleComplete({ variables: { id } });
  };

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, newFilter: FilterType | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleMeasurementUnitChange = async (newUnit: MeasurementUnit) => {
    setMeasurementUnit(newUnit);
    // Update the project's measurement unit
    if (projectId) {
      await updateProject({
        variables: {
          id: projectId,
          input: { measurementUnit: newUnit },
        },
      });
    }
  };

  if (!projectId) {
    return (
      <Container>
        <Alert severity="error">{t('cutList.noProjectId')}</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">
          {t('cutList.loadError')}: {error.message}
        </Alert>
      </Container>
    );
  }

  const project = projectData?.project;
  const completedCount = data?.cutLists?.filter((cut: CutList) => cut.isCompleted).length || 0;
  const totalCount = data?.cutLists?.length || 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ mb: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/app/projects/${projectId}`)}
          sx={{ mb: 3 }}
        >
          {t('projectDetails.backToProjects')}
        </Button>

        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          mb={3}
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
              {t('cutList.title')}
            </Typography>
            {project && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
                  mt: 1,
                }}
              >
                {project.name}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('cutList.unit')}</InputLabel>
              <Select
                value={measurementUnit}
                onChange={(e) => handleMeasurementUnitChange(e.target.value as MeasurementUnit)}
                label={t('cutList.unit')}
              >
                <MenuItem value="inches">{t('cutList.inches')}</MenuItem>
                <MenuItem value="cm">{t('cutList.cm')}</MenuItem>
                <MenuItem value="mm">{t('cutList.mm')}</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
              {t('cutList.addCut')}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Progress Summary */}
      {totalCount > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">
              {t('cutList.progress')}: {completedCount} / {totalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({Math.round((completedCount / totalCount) * 100)}%)
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Filter Buttons */}
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="cut list filter"
        >
          <ToggleButton value="all" aria-label="all cuts">
            <ViewListIcon sx={{ mr: 1 }} />
            {t('cutList.filterAll')}
          </ToggleButton>
          <ToggleButton value="pending" aria-label="pending cuts">
            <RadioButtonUncheckedIcon sx={{ mr: 1 }} />
            {t('cutList.filterPending')}
          </ToggleButton>
          <ToggleButton value="completed" aria-label="completed cuts">
            <CheckCircleIcon sx={{ mr: 1 }} />
            {t('cutList.filterCompleted')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Cut List */}
      {filteredCuts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {filter === 'all'
              ? t('cutList.emptyTitle')
              : filter === 'pending'
                ? t('cutList.noPending')
                : t('cutList.noCompleted')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {filter === 'all' && t('cutList.emptySubtitle')}
          </Typography>
          {filter === 'all' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
              {t('cutList.addFirstCut')}
            </Button>
          )}
        </Paper>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredCuts.map((cut: CutList) => (
            <CutListItem
              key={cut.id}
              cut={cut}
              measurementUnit={measurementUnit}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditCut}
              onDelete={handleDeleteCut}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Modal */}
      <CutListModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCut}
        editingCut={editingCut}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{t('cutList.deleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('cutList.confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
