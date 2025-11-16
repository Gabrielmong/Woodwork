import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import type { Project } from '../../types/project';
import type { Finish } from '../../types/finish';
import { calculateTotalBoardFootage } from '../../types/project';

const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function ProjectTable({ projects, onEdit, onDelete, onRestore }: ProjectTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const calculateProjectCost = (project: Project) => {
    const boards = project.boards || [];
    const finishes = project.finishes || [];

    const materialCost = boards.reduce((total, board) => {
      const lumber = board.lumber;
      if (!lumber) return total;
      const lengthInInches = board.length * 33;
      const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
      const totalBF = boardFeet * board.quantity;
      return total + totalBF * lumber.costPerBoardFoot;
    }, 0);

    const finishCost = finishes.reduce((total, finish) => {
      return total + (finish?.price || 0);
    }, 0);

    return {
      materialCost,
      finishCost,
      totalCost: materialCost + finishCost + (project?.laborCost || 0) + (project?.miscCost || 0),
    };
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('projectTable.projectName'),
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600, color: 'text.primary' }}>{params.value}</Box>
      ),
    },
    {
      field: 'description',
      headerName: t('projectTable.description'),
      flex: 1.5,
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
          {truncateText(params.value)}
        </Box>
      ),
    },
    {
      field: 'boards',
      headerName: t('projectTable.boards'),
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600, color: 'primary.main' }}>{params.value.length}</Box>
      ),
    },
    {
      field: 'boardFootage',
      headerName: t('projectTable.boardFeet'),
      width: 120,
      type: 'number',
      valueGetter: (_value, row) => calculateTotalBoardFootage(row.boards),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600, color: 'primary.main' }}>{params.value.toFixed(2)} BF</Box>
      ),
    },
    {
      field: 'finishes',
      headerName: t('projectDetails.finishes'),
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ py: 0.5 }}>
          {params.value && params.value.length > 0 ? (
            params.value.map((finish: Finish) => {
              return (
                <Chip
                  key={finish.id}
                  label={finish?.name || t('common.unknown')}
                  size="small"
                  sx={{
                    bgcolor: 'background.default',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: '24px',
                  }}
                />
              );
            })
          ) : (
            <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>—</Box>
          )}
        </Stack>
      ),
    },
    {
      field: 'totalCost',
      headerName: t('projectDetails.totalCost'),
      width: 130,
      type: 'number',
      valueGetter: (_value, row) => calculateProjectCost(row),
      renderCell: (params: GridRenderCellParams) => {
        const totalSum = params.value.totalCost;
        return <Box sx={{ fontWeight: 700, color: 'success.main' }}>₡{totalSum.toFixed(2)}</Box>;
      },
    },
    {
      field: 'isDeleted',
      headerName: t('common.status'),
      width: 100,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Chip label={t('common.deleted')} size="small" color="error" sx={{ height: 24 }} />
        ) : (
          <Chip label={t('common.active')} size="small" color="success" sx={{ height: 24 }} />
        ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('common.actions'),
      width: 100,
      getActions: (params) => {
        const project = params.row as Project;
        if (project.isDeleted) {
          return [
            <GridActionsCellItem
              icon={<RestoreIcon />}
              label={t('common.restore')}
              onClick={() => onRestore(project.id)}
              showInMenu={false}
            />,
          ];
        }
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label={t('common.edit')}
            onClick={() => onEdit(project)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label={t('common.delete')}
            onClick={() => onDelete(project.id)}
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
        rows={projects}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        onRowClick={(params) => navigate(`/app/projects/${params.id}`)}
        getRowHeight={() => 'auto'}
        sx={{
          '& .MuiDataGrid-cell': {
            py: 1.5,
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
        }}
      />
    </Box>
  );
}
