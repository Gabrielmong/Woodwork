import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Button, CircularProgress, Snackbar, Typography } from '@mui/material';
import {
  GET_PROJECT,
  DELETE_PROJECT,
  GET_FINISHES,
  GET_LUMBERS,
  GET_SHEET_GOODS,
  UPDATE_PROJECT,
  GET_CONSUMABLES,
  GET_CUT_LISTS,
} from '../../graphql';
import {
  calculateTotalBoardFootage,
  type CreateProjectInput,
  type Project,
  type Board,
  ProjectStatus,
  VARA_TO_INCHES,
} from '../../types/project';
import { ConfirmDialog } from '../General';
import { ProjectForm } from './ProjectForm';
import {
  ProjectHeader,
  ProjectSummary,
  ProjectBoardsSection,
  ProjectFinishesSection,
  ProjectSheetGoodsSection,
  ProjectConsumablesSection,
  ProjectCostBreakdown,
} from './Details';
import { ArrowBack } from '@mui/icons-material';
import { useCurrency } from '../../utils/currency';

export function ProjectDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const formatCurrency = useCurrency();

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
  const { data: consumablesData } = useQuery(GET_CONSUMABLES);
  const { data: cutListsData } = useQuery(GET_CUT_LISTS, {
    variables: { projectId: id || '' },
    skip: !id,
  });

  const activeFinishes = useMemo(() => {
    return (finishesData?.finishes || []).filter((finish: any) => !finish.isDeleted);
  }, [finishesData]);

  const activeLumber = useMemo(() => {
    return (lumberData?.lumbers || []).filter((lumber: any) => !lumber.isDeleted);
  }, [lumberData]);

  const activeSheetGoods = useMemo(() => {
    return (sheetGoodsData?.sheetGoods || []).filter((sheetGood: any) => !sheetGood.isDeleted);
  }, [sheetGoodsData]);

  const activeConsumables = useMemo(() => {
    return (consumablesData?.consumables || []).filter((consumable: any) => !consumable.isDeleted);
  }, [consumablesData]);

  const cutListCompletion = useMemo(() => {
    const cutLists = cutListsData?.cutLists || [];
    if (cutLists.length === 0) return 0;
    const completedCount = cutLists.filter((cut: any) => cut.isCompleted).length;
    return Math.round((completedCount / cutLists.length) * 100);
  }, [cutListsData]);

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
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/app/projects')} sx={{ mb: 3 }}>
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
  const projectFinishes = project?.projectFinishes || [];
  const projectSheetGoods = project?.projectSheetGoods || [];
  const projectConsumables = project?.projectConsumables || [];

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

    const finishCost = projectFinishes.reduce((total: number, projectFinish: any) => {
      const finish = projectFinish.finish;
      if (!finish) return total;
      const percentageDecimal = projectFinish.percentageUsed / 100;
      return total + finish.price * percentageDecimal * projectFinish.quantity;
    }, 0);

    const sheetGoodCost = projectSheetGoods.reduce((total: number, projectSheetGood: any) => {
      return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
    }, 0);

    const consumableCost = projectConsumables.reduce((total: number, projectConsumable: any) => {
      const consumable = projectConsumable.consumable;
      if (!consumable) return total;
      return total + projectConsumable.quantity * consumable.unitPrice;
    }, 0);

    return {
      materialCost,
      finishCost,
      sheetGoodCost,
      consumableCost,
      totalCost:
        materialCost +
        finishCost +
        sheetGoodCost +
        consumableCost +
        (project?.laborCost || 0) +
        (project?.miscCost || 0),
    };
  };

  const { materialCost, finishCost, sheetGoodCost, consumableCost, totalCost } =
    calculateProjectCost();
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

  const handleCutList = () => {
    navigate(`/app/projects/${project.id}/cutlist`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Snackbar
        open={copySuccess}
        message={t('common.linkCopied')}
        autoHideDuration={4000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <ProjectHeader
        projectName={project.name}
        projectDescription={project.description}
        projectStatus={project.status}
        copySuccess={copySuccess}
        cutListCompletion={cutListCompletion}
        onBack={() => navigate('/app/projects')}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onShare={handleShare}
        onStatusChange={handleStatusChange}
        onCutList={handleCutList}
      />

      <ProjectSummary
        totalBoardFootage={totalBoardFootage}
        boardCount={project.boards.length}
        totalCost={totalCost}
        price={project.price}
      />

      <ProjectBoardsSection
        boards={project.boards}
        totalBoardFootage={totalBoardFootage}
        formatCurrency={formatCurrency}
      />

      <ProjectFinishesSection
        projectFinishes={project.projectFinishes}
        formatCurrency={formatCurrency}
      />

      <ProjectSheetGoodsSection
        projectSheetGoods={project.projectSheetGoods}
        formatCurrency={formatCurrency}
      />

      <ProjectConsumablesSection
        projectConsumables={project.projectConsumables}
        formatCurrency={formatCurrency}
      />
      <ProjectCostBreakdown
        materialCost={materialCost}
        finishCost={finishCost}
        sheetGoodCost={sheetGoodCost}
        consumableCost={consumableCost}
        laborCost={project.laborCost}
        miscCost={project.miscCost}
        totalCost={totalCost}
        additionalNotes={project.additionalNotes}
      />

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
        consumableOptions={activeConsumables}
      />
    </Box>
  );
}
