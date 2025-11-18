import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  GET_SHEET_GOODS,
  CREATE_SHEET_GOOD,
  UPDATE_SHEET_GOOD,
  DELETE_SHEET_GOOD,
  RESTORE_SHEET_GOOD,
} from '../../graphql/operations';
import type { CreateSheetGoodInput, SheetGood } from '../../types';
import { ConfirmDialog, ViewLayout } from '../General';
import { SheetGoodList } from './SheetGoodList';
import { SheetGoodTable } from './SheetGoodTable';
import { SheetGoodForm } from './SheetGoodForm';
import { useQueryParams } from '../../hooks/useQueryParams';
import { useTranslation } from 'react-i18next';

export function SheetGoodTab() {
  const { getParam, removeParam } = useQueryParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSheetGood, setEditingSheetGood] = useState<SheetGood | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sheetGoodToDelete, setSheetGoodToDelete] = useState<string | null>(null);
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(GET_SHEET_GOODS, {
    variables: { includeDeleted: showDeleted },
  });

  const [createSheetGood] = useMutation(CREATE_SHEET_GOOD, {
    refetchQueries: [{ query: GET_SHEET_GOODS, variables: { includeDeleted: showDeleted } }],
  });

  const [updateSheetGoodMutation] = useMutation(UPDATE_SHEET_GOOD, {
    refetchQueries: [{ query: GET_SHEET_GOODS, variables: { includeDeleted: showDeleted } }],
  });

  const [deleteSheetGood] = useMutation(DELETE_SHEET_GOOD, {
    refetchQueries: [{ query: GET_SHEET_GOODS, variables: { includeDeleted: showDeleted } }],
  });

  const [restoreSheetGoodMutation] = useMutation(RESTORE_SHEET_GOOD, {
    refetchQueries: [{ query: GET_SHEET_GOODS, variables: { includeDeleted: showDeleted } }],
  });

  const allSheetGoods = data?.sheetGoods || [];
  const activeSheetGoods = allSheetGoods.filter((item: SheetGood) => !item.isDeleted);
  const deletedSheetGoods = allSheetGoods.filter((item: SheetGood) => item.isDeleted);
  const displayedSheetGoods = showDeleted ? allSheetGoods : activeSheetGoods;

  // Check for query param to auto-open form
  useEffect(() => {
    const action = getParam('action');
    if (action === 'new') {
      setEditingSheetGood(null);
      setFormOpen(true);
      removeParam('action');
    }
  }, [getParam, removeParam]);

  const handleAddClick = () => {
    setEditingSheetGood(null);
    setFormOpen(true);
  };

  const handleEditClick = (sheetGood: SheetGood) => {
    setEditingSheetGood(sheetGood);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingSheetGood(null);
  };

  const handleFormSubmit = async (sheetGoodData: CreateSheetGoodInput) => {
    try {
      if (editingSheetGood) {
        await updateSheetGoodMutation({
          variables: {
            id: editingSheetGood.id,
            input: sheetGoodData,
          },
        });
      } else {
        await createSheetGood({
          variables: {
            input: sheetGoodData,
          },
        });
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving sheet good:', error);
    }
  };

  const handleDelete = (id: string) => {
    setSheetGoodToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sheetGoodToDelete) return;

    try {
      await deleteSheetGood({ variables: { id: sheetGoodToDelete } });
      setDeleteConfirmOpen(false);
      setSheetGoodToDelete(null);
    } catch (error) {
      console.error('Error deleting sheet good:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSheetGoodToDelete(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreSheetGoodMutation({ variables: { id } });
    } catch (error) {
      console.error('Error restoring sheet good:', error);
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
        <Typography color="error">Error loading sheet goods: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <>
      <ViewLayout
        title={t('sheetGoods.title')}
        subtitle={t('sheetGoods.subtitle')}
        onAddClick={handleAddClick}
        addButtonText={t('sheetGoods.add')}
        emptyTitle={t('sheetGoods.emptyTitle')}
        emptySubtitle={t('sheetGoods.emptySubtitle')}
        isEmpty={activeSheetGoods.length === 0 && !showDeleted}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        deletedCount={deletedSheetGoods.length}
        cardView={
          <SheetGoodList
            sheetGoods={displayedSheetGoods}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
        tableView={
          <SheetGoodTable
            sheetGoods={displayedSheetGoods}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
      />

      <SheetGoodForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingSheetGood={editingSheetGood}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('common.delete')}
        message={t('sheetGoods.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
