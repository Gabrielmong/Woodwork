import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Stack, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { CreateBoardInput } from '../../../types/project';
import type { Lumber } from '../../../types/lumber';
import BoardInput from '../../Lumber/BoardInput';

interface ProjectBoardsFormSectionProps {
  boards: CreateBoardInput[];
  lumberOptions: Lumber[];
  onAddBoard: () => void;
  onBoardChange: (index: number, board: CreateBoardInput) => void;
  onRemoveBoard: (index: number) => void;
}

export function ProjectBoardsFormSection({
  boards,
  lumberOptions,
  onAddBoard,
  onBoardChange,
  onRemoveBoard,
}: ProjectBoardsFormSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('project.form.boardsSectionTitle')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddBoard}
            disabled={lumberOptions.length === 0}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'rgba(99, 91, 255, 0.08)',
              },
            }}
          >
            {t('project.form.addBoard')}
          </Button>
        </Box>

        {boards.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.default',
            }}
          >
            <Typography color="text.secondary">
              {t('project.form.noBoardsAdded')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {boards.map((board, index) => (
              <BoardInput
                key={index}
                board={board}
                index={index}
                lumberOptions={lumberOptions}
                onChange={onBoardChange}
                onRemove={onRemoveBoard}
              />
            ))}
          </Stack>
        )}
      </Box>
      <Divider />
    </>
  );
}
