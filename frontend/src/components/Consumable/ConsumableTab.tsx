import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  GET_CONSUMABLES,
  CREATE_CONSUMABLE,
  UPDATE_CONSUMABLE,
  DELETE_CONSUMABLE,
  RESTORE_CONSUMABLE,
} from '../../graphql';
import type { CreateConsumableInput, Consumable } from '../../types/consumable';
import { ConfirmDialog, ViewLayout } from '../General';
import { ConsumableList } from './ConsumableList';
import { ConsumableTable } from './ConsumableTable';
import { ConsumableForm } from './ConsumableForm';
import { useQueryParams } from '../../hooks/useQueryParams';
import { useTranslation } from 'react-i18next';

export function ConsumableTab() {
  const { getParam, removeParam } = useQueryParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingConsumable, setEditingConsumable] = useState<Consumable | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [consumableToDelete, setConsumableToDelete] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(GET_CONSUMABLES, {
    variables: { includeDeleted: showDeleted },
  });

  const [createConsumable] = useMutation(CREATE_CONSUMABLE, {
    refetchQueries: [{ query: GET_CONSUMABLES, variables: { includeDeleted: showDeleted } }],
  });

  const [updateConsumableMutation] = useMutation(UPDATE_CONSUMABLE, {
    refetchQueries: [{ query: GET_CONSUMABLES, variables: { includeDeleted: showDeleted } }],
  });

  const [deleteConsumable] = useMutation(DELETE_CONSUMABLE, {
    refetchQueries: [{ query: GET_CONSUMABLES, variables: { includeDeleted: showDeleted } }],
  });

  const [restoreConsumableMutation] = useMutation(RESTORE_CONSUMABLE, {
    refetchQueries: [{ query: GET_CONSUMABLES, variables: { includeDeleted: showDeleted } }],
  });

  const allConsumables = data?.consumables || [];
  const activeConsumables = allConsumables.filter((item: Consumable) => !item.isDeleted);
  const deletedConsumables = allConsumables.filter((item: Consumable) => item.isDeleted);
  const displayedConsumables = showDeleted ? allConsumables : activeConsumables;

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'unitPrice-asc', label: 'Unit Price (Low to High)' },
    { value: 'unitPrice-desc', label: 'Unit Price (High to Low)' },
  ];

  const filteredAndSortedConsumables = useMemo(() => {
    let filtered = [...displayedConsumables];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (consumable) =>
          consumable.name.toLowerCase().includes(searchLower) ||
          (consumable.description && consumable.description.toLowerCase().includes(searchLower))
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
        case 'unitPrice':
          aValue = a.unitPrice || 0;
          bValue = b.unitPrice || 0;
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
  }, [displayedConsumables, searchValue, sortValue]);

  // Check for query param to auto-open form
  useEffect(() => {
    const action = getParam('action');
    if (action === 'new') {
      setEditingConsumable(null);
      setFormOpen(true);
      removeParam('action');
    }
  }, [getParam, removeParam]);

  const handleAddClick = () => {
    setEditingConsumable(null);
    setFormOpen(true);
  };

  const handleEditClick = (consumable: Consumable) => {
    setEditingConsumable(consumable);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingConsumable(null);
  };

  const handleFormSubmit = async (consumableData: CreateConsumableInput) => {
    try {
      if (editingConsumable) {
        await updateConsumableMutation({
          variables: {
            id: editingConsumable.id,
            input: consumableData,
          },
        });
      } else {
        await createConsumable({
          variables: {
            input: consumableData,
          },
        });
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving consumable:', error);
    }
  };

  const handleDelete = (id: string) => {
    setConsumableToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!consumableToDelete) return;

    try {
      await deleteConsumable({ variables: { id: consumableToDelete } });
      setDeleteConfirmOpen(false);
      setConsumableToDelete(null);
    } catch (error) {
      console.error('Error deleting consumable:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setConsumableToDelete(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreConsumableMutation({ variables: { id } });
    } catch (error) {
      console.error('Error restoring consumable:', error);
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
        <Typography color="error">Error loading consumables: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <>
      <ViewLayout
        title={t('consumables.title')}
        subtitle={t('consumables.subtitle')}
        onAddClick={handleAddClick}
        addButtonText={t('consumables.add')}
        emptyTitle={t('consumables.emptyTitle')}
        emptySubtitle={t('consumables.emptySubtitle')}
        isEmpty={activeConsumables.length === 0 && !showDeleted}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        deletedCount={deletedConsumables.length}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        searchPlaceholder="Search consumables by name or description..."
        cardView={
          <ConsumableList
            consumables={filteredAndSortedConsumables}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
        tableView={
          <ConsumableTable
            consumables={filteredAndSortedConsumables}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
      />

      <ConsumableForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingConsumable={editingConsumable}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('common.delete')}
        message={t('consumables.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
