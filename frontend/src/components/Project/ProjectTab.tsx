import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  GET_PROJECTS,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  RESTORE_PROJECT,
  GET_FINISHES,
  GET_LUMBERS,
  GET_SHEET_GOODS,
  GET_CONSUMABLES,
} from '../../graphql';
import { ProjectList } from './ProjectList';
import { ProjectTable } from './ProjectTable';
import { ProjectForm } from './ProjectForm';
import type { Project, CreateProjectInput } from '../../types/project';
import { ProjectStatus } from '../../types/project';
import { ConfirmDialog, ViewLayout } from '../General';
import { useQueryParams } from '../../hooks/useQueryParams';

export function ProjectTab() {
  const { t } = useTranslation();
  const { getParam, removeParam } = useQueryParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({ status: [] });

  const {
    data: projectsData,
    loading: projectsLoading,
    error: projectsError,
  } = useQuery(GET_PROJECTS, {
    variables: { includeDeleted: showDeleted },
  });

  const { data: finishesData } = useQuery(GET_FINISHES);
  const { data: lumberData } = useQuery(GET_LUMBERS);
  const { data: sheetGoodsData } = useQuery(GET_SHEET_GOODS);
  const { data: consumablesData } = useQuery(GET_CONSUMABLES);

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

  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS, variables: { includeDeleted: showDeleted } }],
  });

  const [updateProjectMutation] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS, variables: { includeDeleted: showDeleted } }],
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS, variables: { includeDeleted: showDeleted } }],
  });

  const [restoreProjectMutation] = useMutation(RESTORE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS, variables: { includeDeleted: showDeleted } }],
  });

  const allProjects = projectsData?.projects || [];

  const activeProjects = allProjects.filter((item: Project) => !item.isDeleted);
  const deletedProjects = allProjects.filter((item: Project) => item.isDeleted);

  const displayedProjects = showDeleted ? allProjects : activeProjects;

  const sortOptions = [
    { value: 'name-asc', label: t('projects.sortBy.nameAsc') },
    { value: 'name-desc', label: t('projects.sortBy.nameDesc') },
    { value: 'totalCost-asc', label: t('projects.sortBy.costAsc') },
    { value: 'totalCost-desc', label: t('projects.sortBy.costDesc') },
    { value: 'boardCount-asc', label: t('projects.sortBy.boardCountAsc') },
    { value: 'boardCount-desc', label: t('projects.sortBy.boardCountDesc') },
    { value: 'totalBoardFeet-asc', label: t('projects.sortBy.boardFeetAsc') },
    { value: 'totalBoardFeet-desc', label: t('projects.sortBy.boardFeetDesc') },
  ];

  const filterGroups = [
    {
      id: 'status',
      label: t('projects.filterBy.projectStatus'),
      options: [
        {
          value: ProjectStatus.PLANNED,
          label: t('project.status.planned'),
          color: 'default' as const,
        },
        {
          value: ProjectStatus.IN_PROGRESS,
          label: t('project.status.inProgress'),
          color: 'info' as const,
        },
        {
          value: ProjectStatus.FINISHING,
          label: t('project.status.finishing'),
          color: 'warning' as const,
        },
        {
          value: ProjectStatus.COMPLETED,
          label: t('project.status.completed'),
          color: 'success' as const,
        },
      ],
    },
  ];

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...displayedProjects];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          (project.description && project.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (activeFilters.status && activeFilters.status.length > 0) {
      filtered = filtered.filter((project) => activeFilters.status.includes(project.status));
    }

    // Apply sorting
    const [field, direction] = sortValue.split('-');
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalCost':
          aValue = a.totalCost || 0;
          bValue = b.totalCost || 0;
          break;
        case 'boardCount':
          aValue = a.boards?.length || 0;
          bValue = b.boards?.length || 0;
          break;
        case 'totalBoardFeet':
          aValue = a.totalBoardFeet || 0;
          bValue = b.totalBoardFeet || 0;
          break;
        default:
          return 0;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [displayedProjects, searchValue, sortValue, activeFilters]);

  // Check for query param to auto-open form
  useEffect(() => {
    const action = getParam('action');
    if (action === 'new') {
      setEditingProject(null);
      setFormOpen(true);
      removeParam('action');
    }
  }, [getParam, removeParam]);

  const handleAddClick = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProject(null);
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
      } else {
        await createProject({
          variables: {
            input: projectData,
          },
        });
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject({ variables: { id: projectToDelete } });
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProjectMutation({ variables: { id } });
    } catch (error) {
      console.error('Error restoring project:', error);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await updateProjectMutation({
        variables: {
          id: projectId,
          input: { status: newStatus },
        },
      });
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const loading = projectsLoading;

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (projectsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading projects: {projectsError.message}</Typography>
      </Box>
    );
  }

  return (
    <>
      <ViewLayout
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        onAddClick={handleAddClick}
        addButtonText={t('projects.add')}
        emptyTitle={t('projects.emptyTitle')}
        emptySubtitle={t('projects.emptySubtitle')}
        isEmpty={activeProjects.length === 0 && !showDeleted}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        deletedCount={deletedProjects.length}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        searchPlaceholder={t('projects.searchPlaceholder')}
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        cardView={
          <ProjectList
            projects={filteredAndSortedProjects}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onStatusChange={handleStatusChange}
          />
        }
        tableView={
          <ProjectTable
            projects={filteredAndSortedProjects}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onStatusChange={handleStatusChange}
          />
        }
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('projects.deleteDialog.title')}
        message={t('projects.deleteDialog.message')}
        confirmText={t('projects.deleteDialog.confirm')}
        cancelText={t('projects.deleteDialog.cancel')}
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
