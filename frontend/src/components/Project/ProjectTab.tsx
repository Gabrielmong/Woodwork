import { useState, useMemo, useEffect } from 'react';
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
} from '../../graphql/operations';
import { ProjectList } from './ProjectList';
import { ProjectTable } from './ProjectTable';
import { ProjectForm } from './ProjectForm';
import type { Project, CreateProjectInput } from '../../types/project';
import { ProjectStatus } from '../../types/project';
import { ConfirmDialog, ViewLayout } from '../General';
import { useQueryParams } from '../../hooks/useQueryParams';

export function ProjectTab() {
  const { getParam, removeParam } = useQueryParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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

  const activeFinishes = useMemo(() => {
    return (finishesData?.finishes || []).filter((finish: any) => !finish.isDeleted);
  }, [finishesData]);

  const activeLumber = useMemo(() => {
    return (lumberData?.lumbers || []).filter((lumber: any) => !lumber.isDeleted);
  }, [lumberData]);

  const activeSheetGoods = useMemo(() => {
    return (sheetGoodsData?.sheetGoods || []).filter((sheetGood: any) => !sheetGood.isDeleted);
  }, [sheetGoodsData]);

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
        title="Projects"
        subtitle="Plan and estimate your woodworking projects with material and cost calculations"
        onAddClick={handleAddClick}
        addButtonText="New Project"
        emptyTitle="No projects yet"
        emptySubtitle="Get started by creating your first project to calculate materials, costs, and plan your woodworking"
        isEmpty={activeProjects.length === 0 && !showDeleted}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        deletedCount={deletedProjects.length}
        cardView={
          <ProjectList
            projects={displayedProjects}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onStatusChange={handleStatusChange}
          />
        }
        tableView={
          <ProjectTable
            projects={displayedProjects}
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
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action will mark it as deleted but can be restored later."
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
