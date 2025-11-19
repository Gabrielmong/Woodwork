import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  GET_TOOLS,
  CREATE_TOOL,
  UPDATE_TOOL,
  DELETE_TOOL,
  RESTORE_TOOL,
} from '../../graphql/operations';
import { ToolForm } from './ToolForm';
import { ToolList } from './ToolList';
import { ToolTable } from './ToolTable';
import { ConfirmDialog, ViewLayout } from '../General';
import type { Tool, CreateToolInput } from '../../types/tool';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from '../../hooks/useQueryParams';

export function ToolTab() {
  const { t } = useTranslation();
  const { getParam, removeParam } = useQueryParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');

  const { data, loading, error } = useQuery(GET_TOOLS, {
    variables: { includeDeleted: showDeleted },
  });

  const [createTool] = useMutation(CREATE_TOOL, {
    refetchQueries: [{ query: GET_TOOLS, variables: { includeDeleted: showDeleted } }],
  });

  const [updateToolMutation] = useMutation(UPDATE_TOOL, {
    refetchQueries: [{ query: GET_TOOLS, variables: { includeDeleted: showDeleted } }],
  });

  const [deleteTool] = useMutation(DELETE_TOOL, {
    refetchQueries: [{ query: GET_TOOLS, variables: { includeDeleted: showDeleted } }],
  });

  const [restoreToolMutation] = useMutation(RESTORE_TOOL, {
    refetchQueries: [{ query: GET_TOOLS, variables: { includeDeleted: showDeleted } }],
  });

  const allTools = data?.tools || [];
  const activeTools = allTools.filter((item: Tool) => !item.isDeleted);
  const deletedTools = allTools.filter((item: Tool) => item.isDeleted);
  const displayedTools = showDeleted ? allTools : activeTools;

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'function-asc', label: 'Function (A-Z)' },
    { value: 'function-desc', label: 'Function (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
  ];

  const filteredAndSortedTools = useMemo(() => {
    let filtered = [...displayedTools];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchLower) ||
          (tool.description && tool.description.toLowerCase().includes(searchLower)) ||
          (tool.function && tool.function.toLowerCase().includes(searchLower)) ||
          (tool.serialNumber && tool.serialNumber.toLowerCase().includes(searchLower))
      );
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
        case 'function':
          aValue = (a.function || '').toLowerCase();
          bValue = (b.function || '').toLowerCase();
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
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
  }, [displayedTools, searchValue, sortValue]);

  // Check for query param to auto-open form
  useEffect(() => {
    const action = getParam('action');
    if (action === 'new') {
      setEditingTool(null);
      setFormOpen(true);
      removeParam('action');
    }
  }, [getParam, removeParam]);

  const handleAddClick = () => {
    setEditingTool(null);
    setFormOpen(true);
  };

  const handleEditClick = (tool: Tool) => {
    setEditingTool(tool);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTool(null);
  };

  const handleFormSubmit = async (toolData: CreateToolInput) => {
    try {
      if (editingTool) {
        await updateToolMutation({
          variables: {
            id: editingTool.id,
            input: toolData,
          },
        });
      } else {
        await createTool({
          variables: {
            input: toolData,
          },
        });
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving tool:', error);
    }
  };

  const handleDelete = (id: string) => {
    setToolToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!toolToDelete) return;

    try {
      await deleteTool({ variables: { id: toolToDelete } });
      setDeleteConfirmOpen(false);
      setToolToDelete(null);
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setToolToDelete(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreToolMutation({ variables: { id } });
    } catch (error) {
      console.error('Error restoring tool:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading tools: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <>
      <ViewLayout
        title={t('tools.title')}
        subtitle={t('tools.subtitle')}
        onAddClick={handleAddClick}
        addButtonText={t('tools.add')}
        emptyTitle={t('tools.emptyTitle')}
        emptySubtitle={t('tools.emptySubtitle')}
        isEmpty={activeTools.length === 0 && !showDeleted}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        deletedCount={deletedTools.length}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        searchPlaceholder="Search tools by name, description, function, or serial number..."
        cardView={
          <ToolList
            tools={filteredAndSortedTools}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
        tableView={
          <ToolTable
            tools={filteredAndSortedTools}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
      />

      <ToolForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingTool={editingTool}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('common.delete')}
        message={t('tools.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
