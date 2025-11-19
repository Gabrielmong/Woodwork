import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Box,
  Stack,
  IconButton,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

export interface FilterOption {
  value: string;
  label: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterButtonProps {
  filterGroups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
}

export function FilterButton({ filterGroups, activeFilters, onFiltersChange }: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(activeFilters);

  const handleOpen = () => {
    setLocalFilters(activeFilters);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClearAll = () => {
    const emptyFilters: Record<string, string[]> = {};
    filterGroups.forEach((group) => {
      emptyFilters[group.id] = [];
    });
    setLocalFilters(emptyFilters);
  };

  const handleToggleFilter = (groupId: string, value: string) => {
    setLocalFilters((prev) => {
      const groupFilters = prev[groupId] || [];
      const newGroupFilters = groupFilters.includes(value)
        ? groupFilters.filter((v) => v !== value)
        : [...groupFilters, value];

      return {
        ...prev,
        [groupId]: newGroupFilters,
      };
    });
  };

  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, filters) => sum + filters.length,
    0
  );

  const getFilterLabel = (groupId: string, value: string): string => {
    const group = filterGroups.find((g) => g.id === groupId);
    const option = group?.options.find((o) => o.value === value);
    return option?.label || value;
  };

  return (
    <>
      <Button
        variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
        startIcon={<FilterListIcon />}
        onClick={handleOpen}
        sx={{
          borderColor: activeFilterCount > 0 ? undefined : 'divider',
          minWidth: { xs: 'auto', sm: 120 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Filters
        </Box>
        {activeFilterCount > 0 && (
          <Chip
            label={activeFilterCount}
            size="small"
            sx={{
              ml: 1,
              height: 20,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        )}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>Filters</Box>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Filters ({activeFilterCount})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {Object.entries(localFilters).map(([groupId, values]) =>
                    values.map((value) => (
                      <Chip
                        key={`${groupId}-${value}`}
                        label={getFilterLabel(groupId, value)}
                        size="small"
                        onDelete={() => handleToggleFilter(groupId, value)}
                      />
                    ))
                  )}
                </Box>
              </Box>
            )}

            {/* Filter Groups */}
            {filterGroups.map((group) => (
              <FormControl key={group.id} component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  {group.label}
                </FormLabel>
                <FormGroup>
                  {group.options.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={localFilters[group.id]?.includes(option.value) || false}
                          onChange={() => handleToggleFilter(group.id, option.value)}
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {option.color && (
                            <Chip
                              label={option.label}
                              size="small"
                              color={option.color}
                              sx={{ minWidth: 8 }}
                            />
                          )}
                        </Stack>
                      }
                    />
                  ))}
                </FormGroup>
              </FormControl>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClearAll} color="error">
            Clear All
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
