import { useState, useEffect, useMemo } from 'react';
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
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    materialType: [],
  });
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

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'materialType-asc', label: 'Material Type (A-Z)' },
    { value: 'materialType-desc', label: 'Material Type (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'width-asc', label: 'Width (Small to Large)' },
    { value: 'width-desc', label: 'Width (Large to Small)' },
  ];

  // Extract unique material types for filtering
  const uniqueMaterialTypes = useMemo(() => {
    const types = new Set<string>();
    displayedSheetGoods.forEach((sg: SheetGood) => {
      if (sg.materialType) types.add(sg.materialType);
    });
    return Array.from(types).sort();
  }, [displayedSheetGoods]);

  const filterGroups = useMemo(
    () => [
      {
        id: 'materialType',
        label: 'Material Type',
        options: uniqueMaterialTypes.map((type) => ({
          value: type,
          label: type,
        })),
      },
    ],
    [uniqueMaterialTypes]
  );

  const filteredAndSortedSheetGoods = useMemo(() => {
    let filtered = [...displayedSheetGoods];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (sheetGood) =>
          sheetGood.name.toLowerCase().includes(searchLower) ||
          (sheetGood.description && sheetGood.description.toLowerCase().includes(searchLower)) ||
          (sheetGood.materialType && sheetGood.materialType.toLowerCase().includes(searchLower))
      );
    }

    // Apply material type filter
    if (activeFilters.materialType && activeFilters.materialType.length > 0) {
      filtered = filtered.filter((sheetGood) =>
        activeFilters.materialType.includes(sheetGood.materialType)
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
        case 'materialType':
          aValue = (a.materialType || '').toLowerCase();
          bValue = (b.materialType || '').toLowerCase();
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'width':
          aValue = a.width || 0;
          bValue = b.width || 0;
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
  }, [displayedSheetGoods, searchValue, sortValue, activeFilters]);

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
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        searchPlaceholder="Search sheet goods by name, description, or material type..."
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        cardView={
          <SheetGoodList
            sheetGoods={filteredAndSortedSheetGoods}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
        tableView={
          <SheetGoodTable
            sheetGoods={filteredAndSortedSheetGoods}
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
