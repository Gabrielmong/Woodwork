import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  GET_FINISHES,
  CREATE_FINISH,
  UPDATE_FINISH,
  DELETE_FINISH,
  RESTORE_FINISH,
} from '../../graphql';
import type { CreateFinishInput, Finish } from '../../types';
import { ConfirmDialog, ViewLayout } from '../General';
import { FinishList } from './FinishList';
import { FinishTable } from './FinishTable';
import { FinishForm } from './FinishForm';
import { useQueryParams } from '../../hooks/useQueryParams';
import { useTranslation } from 'react-i18next';

export function FinishTab() {
  const { getParam, removeParam } = useQueryParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingFinish, setEditingFinish] = useState<Finish | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [finishToDelete, setFinishToDelete] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(GET_FINISHES, {
    variables: { includeDeleted: showDeleted },
  });

  const [createFinish] = useMutation(CREATE_FINISH, {
    refetchQueries: [{ query: GET_FINISHES, variables: { includeDeleted: showDeleted } }],
  });

  const [updateFinishMutation] = useMutation(UPDATE_FINISH, {
    refetchQueries: [{ query: GET_FINISHES, variables: { includeDeleted: showDeleted } }],
  });

  const [deleteFinish] = useMutation(DELETE_FINISH, {
    refetchQueries: [{ query: GET_FINISHES, variables: { includeDeleted: showDeleted } }],
  });

  const [restoreFinishMutation] = useMutation(RESTORE_FINISH, {
    refetchQueries: [{ query: GET_FINISHES, variables: { includeDeleted: showDeleted } }],
  });

  const allFinishes = data?.finishes || [];
  const activeFinishes = allFinishes.filter((item: Finish) => !item.isDeleted);
  const deletedFinishes = allFinishes.filter((item: Finish) => item.isDeleted);
  const displayedFinishes = showDeleted ? allFinishes : activeFinishes;

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
  ];

  const filteredAndSortedFinishes = useMemo(() => {
    let filtered = [...displayedFinishes];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (finish) =>
          finish.name.toLowerCase().includes(searchLower) ||
          (finish.description && finish.description.toLowerCase().includes(searchLower))
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
  }, [displayedFinishes, searchValue, sortValue]);

  // Check for query param to auto-open form
  useEffect(() => {
    const action = getParam('action');
    if (action === 'new') {
      setEditingFinish(null);
      setFormOpen(true);
      removeParam('action');
    }
  }, [getParam, removeParam]);

  const handleAddClick = () => {
    setEditingFinish(null);
    setFormOpen(true);
  };

  const handleEditClick = (finish: Finish) => {
    setEditingFinish(finish);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingFinish(null);
  };

  const handleFormSubmit = async (finishData: CreateFinishInput) => {
    try {
      if (editingFinish) {
        await updateFinishMutation({
          variables: {
            id: editingFinish.id,
            input: finishData,
          },
        });
      } else {
        await createFinish({
          variables: {
            input: finishData,
          },
        });
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving finish:', error);
    }
  };

  const handleDelete = (id: string) => {
    setFinishToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!finishToDelete) return;

    try {
      await deleteFinish({ variables: { id: finishToDelete } });
      setDeleteConfirmOpen(false);
      setFinishToDelete(null);
    } catch (error) {
      console.error('Error deleting finish:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setFinishToDelete(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreFinishMutation({ variables: { id } });
    } catch (error) {
      console.error('Error restoring finish:', error);
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
        <Typography color="error">Error loading finishes: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <>
      <ViewLayout
        title={t('finishes.title')}
        subtitle={t('finishes.subtitle')}
        onAddClick={handleAddClick}
        addButtonText={t('finishes.add')}
        emptyTitle={t('finishes.emptyTitle')}
        emptySubtitle={t('finishes.emptySubtitle')}
        isEmpty={activeFinishes.length === 0 && !showDeleted}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        deletedCount={deletedFinishes.length}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        searchPlaceholder="Search finishes by name or description..."
        cardView={
          <FinishList
            finishes={filteredAndSortedFinishes}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
        tableView={
          <FinishTable
            finishes={filteredAndSortedFinishes}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
      />

      <FinishForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingFinish={editingFinish}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('common.delete')}
        message={t('finishes.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
