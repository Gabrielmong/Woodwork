import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { Chip, Stack, Box, Select, MenuItem, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ShareIcon from '@mui/icons-material/Share';
import type { Project, ProjectSheetGood } from '../../types/project';
import type { Finish } from '../../types/finish';
import { calculateTotalBoardFootage, ProjectStatus } from '../../types/project';
import { StatusChip } from './utils';

const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

export function ProjectTable({
  projects,
  onEdit,
  onDelete,
  onRestore,
  onStatusChange,
}: ProjectTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleShare = async (projectId: string) => {
    const shareUrl = `${window.location.origin}/shared/${projectId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculateProjectCost = (project: Project) => {
    const boards = project.boards || [];
    const finishes = project.finishes || [];
    const projectSheetGoods = project.projectSheetGoods || [];
    const projectConsumables = project.projectConsumables || [];

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

    const sheetGoodCost = projectSheetGoods.reduce((total, projectSheetGood) => {
      return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
    }, 0);

    const consumableCost = projectConsumables.reduce((total, projectConsumable) => {
      const consumable = projectConsumable.consumable;
      if (!consumable) return total;
      const unitPrice = consumable.price / consumable.packageQuantity;
      return total + projectConsumable.quantity * unitPrice;
    }, 0);

    return {
      materialCost,
      finishCost,
      sheetGoodCost,
      consumableCost,
      totalCost:
        materialCost +
        finishCost +
        sheetGoodCost +
        consumableCost +
        (project?.laborCost || 0) +
        (project?.miscCost || 0),
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
      field: 'projectSheetGoods',
      headerName: t('projects.sheetGoodsHeader'),
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ py: 0.5 }}>
          {params.value && params.value.length > 0 ? (
            params.value.map((projectSheetGood: ProjectSheetGood) => {
              return (
                <Chip
                  key={projectSheetGood.id}
                  label={`${projectSheetGood.sheetGood?.name || t('common.unknown')} (${projectSheetGood.quantity})`}
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
      field: 'projectConsumables',
      headerName: t('projects.consumablesHeader'),
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ py: 0.5 }}>
          {params.value && params.value.length > 0 ? (
            params.value.map((projectConsumable: any) => {
              return (
                <Chip
                  key={projectConsumable.id}
                  label={`${projectConsumable.consumable?.name || t('common.unknown')} (${projectConsumable.quantity} ${t('projects.itemsSuffix')})`}
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
      field: 'status',
      headerName: t('common.status'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const project = params.row as Project;
        if (project.isDeleted || !onStatusChange) {
          return <StatusChip status={params.value as ProjectStatus} />;
        }
        return (
          <FormControl size="small" fullWidth onClick={(e) => e.stopPropagation()}>
            <Select
              value={params.value}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(project.id, e.target.value as ProjectStatus);
              }}
              size="small"
              sx={{
                '& .MuiSelect-select': {
                  py: 0.5,
                  fontSize: '0.875rem',
                },
              }}
            >
              <MenuItem value={ProjectStatus.PLANNED}>
                <Chip
                  label={t('project.status.planned')}
                  size="small"
                  color="default"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
              </MenuItem>
              <MenuItem value={ProjectStatus.IN_PROGRESS}>
                <Chip
                  label={t('project.status.inProgress')}
                  size="small"
                  color="info"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
              </MenuItem>
              <MenuItem value={ProjectStatus.FINISHING}>
                <Chip
                  label={t('project.status.finishing')}
                  size="small"
                  color="warning"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
              </MenuItem>
              <MenuItem value={ProjectStatus.COMPLETED}>
                <Chip
                  label={t('project.status.completed')}
                  size="small"
                  color="success"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
              </MenuItem>
            </Select>
          </FormControl>
        );
      },
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
            icon={<ShareIcon />}
            label={t('projects.share')}
            onClick={() => handleShare(project.id)}
            showInMenu={false}
          />,
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
