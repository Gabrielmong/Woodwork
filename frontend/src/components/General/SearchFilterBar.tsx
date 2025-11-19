import { Stack, TextField, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { FilterButton, type FilterGroup } from './FilterButton';

export interface SortOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  activeFilters?: Record<string, string[]>;
  onFiltersChange?: (filters: Record<string, string[]>) => void;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  sortOptions,
  searchPlaceholder = 'Search...',
  filterGroups = [],
  activeFilters = {},
  onFiltersChange,
}: SearchFilterBarProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          width: '100%',
        }}
      >
        <TextField
          fullWidth
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <FormControl
          sx={{
            minWidth: { xs: '100%', sm: 200 },
            bgcolor: 'background.paper',
          }}
        >
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortValue}
            label="Sort By"
            onChange={(e) => onSortChange(e.target.value)}
            startAdornment={<SortIcon sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {filterGroups.length > 0 && onFiltersChange && (
          <FilterButton
            filterGroups={filterGroups}
            activeFilters={activeFilters}
            onFiltersChange={onFiltersChange}
          />
        )}
      </Stack>
    </Box>
  );
}
