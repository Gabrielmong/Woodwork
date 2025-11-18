import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { Chip, Stack, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import type { SheetGood } from '../../types';

interface SheetGoodTableProps {
  sheetGoods: SheetGood[];
  onEdit: (sheetGood: SheetGood) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function SheetGoodTable({ sheetGoods, onEdit, onDelete, onRestore }: SheetGoodTableProps) {
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600, color: 'text.primary' }}>{params.value}</Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'text.secondary',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'width',
      headerName: 'Width (in)',
      width: 110,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'text.primary' }}>{params.value}"</Box>
      ),
    },
    {
      field: 'length',
      headerName: 'Length (in)',
      width: 110,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'text.primary' }}>{params.value}"</Box>
      ),
    },
    {
      field: 'thickness',
      headerName: 'Thickness (in)',
      width: 130,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'text.primary' }}>{params.value}"</Box>
      ),
    },
    {
      field: 'materialType',
      headerName: 'Material',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: 'background.default',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
          }}
        />
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 110,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600, color: 'success.main' }}>₡{params.value.toFixed(2)}</Box>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1.5,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ py: 0.5 }}>
          {params.value && params.value.length > 0 ? (
            params.value.map((tag: string, index: number) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  bgcolor: 'background.default',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: '24px',
                }}
              />
            ))
          ) : (
            <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>—</Box>
          )}
        </Stack>
      ),
    },
    {
      field: 'isDeleted',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Chip label="Deleted" size="small" color="error" sx={{ height: 24 }} />
        ) : (
          <Chip label="Active" size="small" color="success" sx={{ height: 24 }} />
        ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => {
        const sheetGood = params.row as SheetGood;
        if (sheetGood.isDeleted) {
          return [
            <GridActionsCellItem
              icon={<RestoreIcon />}
              label="Restore"
              onClick={() => onRestore(sheetGood.id)}
              showInMenu={false}
            />,
          ];
        }
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => onEdit(sheetGood)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => onDelete(sheetGood.id)}
            showInMenu={false}
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 600,
        width: '100%',
        '& .MuiDataGrid-root': {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        },
        '& .MuiDataGrid-cell': {
          borderColor: 'divider',
        },
        '& .MuiDataGrid-columnHeaders': {
          bgcolor: 'rgba(99, 91, 255, 0.05)',
          borderColor: 'divider',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700,
          color: 'text.primary',
        },
        '& .MuiDataGrid-row': {
          '&:hover': {
            bgcolor: 'action.hover',
          },
          '&.Mui-selected': {
            bgcolor: 'rgba(99, 91, 255, 0.08)',
            '&:hover': {
              bgcolor: 'rgba(99, 91, 255, 0.12)',
            },
          },
        },
        '& .MuiDataGrid-footerContainer': {
          borderColor: 'divider',
        },
      }}
    >
      <DataGrid
        rows={sheetGoods}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        getRowHeight={() => 'auto'}
        sx={{
          '& .MuiDataGrid-cell': {
            py: 1.5,
          },
        }}
      />
    </Box>
  );
}
