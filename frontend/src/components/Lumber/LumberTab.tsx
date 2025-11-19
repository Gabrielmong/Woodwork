import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  GET_LUMBERS,
  CREATE_LUMBER,
  UPDATE_LUMBER,
  DELETE_LUMBER,
  RESTORE_LUMBER,
} from '../../graphql/operations';
import LumberList from './LumberList';
import LumberTable from './LumberTable';
import LumberForm from './LumberForm';
import type { Lumber, CreateLumberInput } from '../../types/lumber';
import { ConfirmDialog, ViewLayout } from '../General';
import { useQueryParams } from '../../hooks/useQueryParams';
import { useTranslation } from 'react-i18next';

export default function LumberTab() {
  const { getParam, removeParam } = useQueryParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLumber, setEditingLumber] = useState<Lumber | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lumberToDelete, setLumberToDelete] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(GET_LUMBERS, {
    variables: { includeDeleted: showDeleted },
  });

  const [createLumber] = useMutation(CREATE_LUMBER, {
    refetchQueries: [{ query: GET_LUMBERS, variables: { includeDeleted: showDeleted } }],
  });

  const [updateLumberMutation] = useMutation(UPDATE_LUMBER, {
    refetchQueries: [{ query: GET_LUMBERS, variables: { includeDeleted: showDeleted } }],
  });

  const [deleteLumber] = useMutation(DELETE_LUMBER, {
    refetchQueries: [{ query: GET_LUMBERS, variables: { includeDeleted: showDeleted } }],
  });

  const [restoreLumberMutation] = useMutation(RESTORE_LUMBER, {
    refetchQueries: [{ query: GET_LUMBERS, variables: { includeDeleted: showDeleted } }],
  });

  const allLumber = data?.lumbers || [];
  const activeLumber = allLumber.filter((item: Lumber) => !item.isDeleted);
  const deletedLumber = allLumber.filter((item: Lumber) => item.isDeleted);
  const displayedLumber = showDeleted ? allLumber : activeLumber;

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'costPerBoardFoot-asc', label: 'Cost (Low to High)' },
    { value: 'costPerBoardFoot-desc', label: 'Cost (High to Low)' },
    { value: 'jankaRating-asc', label: 'Janka Rating (Low to High)' },
    { value: 'jankaRating-desc', label: 'Janka Rating (High to Low)' },
  ];

  const filteredAndSortedLumber = useMemo(() => {
    let filtered = [...displayedLumber];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (lumber) =>
          lumber.name.toLowerCase().includes(searchLower) ||
          (lumber.description && lumber.description.toLowerCase().includes(searchLower))
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
        case 'costPerBoardFoot':
          aValue = a.costPerBoardFoot || 0;
          bValue = b.costPerBoardFoot || 0;
          break;
        case 'jankaRating':
          aValue = a.jankaRating || 0;
          bValue = b.jankaRating || 0;
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
  }, [displayedLumber, searchValue, sortValue]);

  // Check for query param to auto-open form
  useEffect(() => {
    const action = getParam('action');
    if (action === 'new') {
      setEditingLumber(null);
      setFormOpen(true);
      removeParam('action');
    }
  }, [getParam, removeParam]);

  const handleAddClick = () => {
    setEditingLumber(null);
    setFormOpen(true);
  };

  const handleEditClick = (lumber: Lumber) => {
    setEditingLumber(lumber);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingLumber(null);
  };

  const handleFormSubmit = async (lumberData: CreateLumberInput) => {
    try {
      if (editingLumber) {
        await updateLumberMutation({
          variables: {
            id: editingLumber.id,
            input: lumberData,
          },
        });
      } else {
        await createLumber({
          variables: {
            input: lumberData,
          },
        });
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving lumber:', error);
    }
  };

  const handleDelete = (id: string) => {
    setLumberToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!lumberToDelete) return;

    try {
      await deleteLumber({ variables: { id: lumberToDelete } });
      setDeleteConfirmOpen(false);
      setLumberToDelete(null);
    } catch (error) {
      console.error('Error deleting lumber:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setLumberToDelete(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreLumberMutation({ variables: { id } });
    } catch (error) {
      console.error('Error restoring lumber:', error);
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
        <Typography color="error">Error loading lumber: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <>
      <ViewLayout
        title={t('lumber.title')}
        subtitle={t('lumber.subtitle')}
        onAddClick={handleAddClick}
        addButtonText={t('lumber.add')}
        emptyTitle={t('lumber.emptyTitle')}
        emptySubtitle={t('lumber.emptySubtitle')}
        isEmpty={activeLumber.length === 0 && !showDeleted}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
        deletedCount={deletedLumber.length}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        searchPlaceholder="Search lumber by name or description..."
        cardView={
          <LumberList
            lumber={filteredAndSortedLumber}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
        tableView={
          <LumberTable
            lumber={filteredAndSortedLumber}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        }
      />

      <LumberForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingLumber={editingLumber}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('common.delete')}
        message={t('lumber.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
