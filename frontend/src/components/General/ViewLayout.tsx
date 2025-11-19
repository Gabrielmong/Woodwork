import { type ReactNode, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { SearchFilterBar, type SortOption } from './SearchFilterBar';
import type { FilterGroup } from './FilterButton';

export type ViewMode = 'card' | 'table';

interface ViewLayoutProps {
  title: string;
  subtitle: string;
  onAddClick: () => void;
  addButtonText: string;
  emptyTitle: string;
  emptySubtitle: string;
  isEmpty: boolean;
  cardView: ReactNode;
  tableView: ReactNode;
  defaultView?: ViewMode;
  showDeleted?: boolean;
  onShowDeletedChange?: (show: boolean) => void;
  deletedCount?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: SortOption[];
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  activeFilters?: Record<string, string[]>;
  onFiltersChange?: (filters: Record<string, string[]>) => void;
}

export function ViewLayout({
  title,
  subtitle,
  onAddClick,
  addButtonText,
  emptyTitle,
  emptySubtitle,
  isEmpty,
  cardView,
  tableView,
  defaultView = 'card',
  showDeleted = false,
  onShowDeletedChange,
  deletedCount = 0,
  searchValue = '',
  onSearchChange,
  sortValue = '',
  onSortChange,
  sortOptions = [],
  searchPlaceholder,
  filterGroups = [],
  activeFilters = {},
  onFiltersChange,
}: ViewLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleToggleDeleted = () => {
    if (onShowDeletedChange) {
      onShowDeletedChange(!showDeleted);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 3, sm: 0 }}
        sx={{ mb: { xs: 4, md: 6 } }}
      >
        <Box>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              mb: { xs: 1, md: 1.5 },
              fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' },
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
              maxWidth: '600px',
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap', gap: 1 }}
        >
          {!isEmpty && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              aria-label="view mode"
              sx={{
                bgcolor: 'background.paper',
                '& .MuiToggleButton-root': {
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  px: 2,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
              }}
            >
              <ToggleButton value="card" aria-label="card view">
                <ViewModuleIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Cards
                </Box>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <TableRowsIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Table
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          {onShowDeletedChange && deletedCount > 0 && (
            <Button
              variant={showDeleted ? 'contained' : 'outlined'}
              size="large"
              startIcon={showDeleted ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={handleToggleDeleted}
              sx={{
                borderColor: showDeleted ? undefined : 'divider',
                color: showDeleted ? 'white' : 'text.secondary',
                bgcolor: showDeleted ? 'warning.main' : undefined,
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '0.9375rem', md: '1rem' },
                '&:hover': {
                  borderColor: showDeleted ? undefined : 'warning.main',
                  color: showDeleted ? 'white' : 'warning.main',
                  bgcolor: showDeleted ? 'warning.dark' : 'rgba(255, 153, 0, 0.08)',
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, mr: 1 }}>
                {showDeleted ? 'Hide' : 'Show'}
              </Box>
              Deleted
              <Chip
                label={deletedCount}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  bgcolor: showDeleted ? 'rgba(255, 255, 255, 0.2)' : 'warning.light',
                  color: showDeleted ? 'white' : 'warning.dark',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 2 },
              fontSize: { xs: '0.9375rem', md: '1rem' },
              minWidth: { xs: isEmpty ? '100%' : 'auto', sm: 'auto' },
              '&:hover': {
                background: 'linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%)',
              },
            }}
          >
            {addButtonText}
          </Button>
        </Stack>
      </Stack>

      {isEmpty ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 16 },
            px: { xs: 3, md: 6 },
            bgcolor: 'background.paper',
            borderRadius: { xs: 2, md: 4 },
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h4"
            color="text.secondary"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.5rem', md: '2rem' },
              mb: { xs: 2, md: 3 },
            }}
          >
            {emptyTitle}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: { xs: 3, md: 4 },
              fontSize: { xs: '0.875rem', md: '1.125rem' },
              maxWidth: '500px',
              mx: 'auto',
            }}
          >
            {emptySubtitle}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{
              background: 'linear-gradient(135deg, #635BFF 0%, #7A73FF 100%)',
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 2 },
              fontSize: { xs: '0.9375rem', md: '1rem' },
            }}
          >
            {addButtonText}
          </Button>
        </Box>
      ) : (
        <>
          {onSearchChange && onSortChange && sortOptions.length > 0 && (
            <SearchFilterBar
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              sortValue={sortValue}
              onSortChange={onSortChange}
              sortOptions={sortOptions}
              searchPlaceholder={searchPlaceholder}
              filterGroups={filterGroups}
              activeFilters={activeFilters}
              onFiltersChange={onFiltersChange}
            />
          )}
          <Box>{viewMode === 'card' ? cardView : tableView}</Box>
        </>
      )}
    </Box>
  );
}
