import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ArrowDownward } from '@mui/icons-material';
import { calculateTotalBoardFootage, type Project } from '../../../types/project';

interface ProjectCardMaterialsProps {
  project: Project;
}

export function ProjectCardMaterials({ project }: ProjectCardMaterialsProps) {
  const { t } = useTranslation();
  const totalBoardFootage = calculateTotalBoardFootage(project.boards || []);

  return (
    <Stack spacing={2.5}>
      {project.boards && project.boards.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('projects.boards')} ({totalBoardFootage.toFixed(2)} BF total):
          </Typography>
          <Accordion elevation={0} sx={{ bgcolor: 'background.default' }}>
            <AccordionSummary
              expandIcon={<ArrowDownward />}
              aria-controls="boards-content"
              id="boards-header"
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                {t('projectDetails.viewBoards')}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={1}>
                {project.boards.map((board, idx) => {
                  const lumber = board.lumber;
                  const lengthInInches = board.length * 33;
                  const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
                  const totalBF = boardFeet * board.quantity;

                  return (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        bgcolor: 'rgba(99, 91, 255, 0.03)',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {lumber?.name || t('projects.unknownWood')}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} color="primary.main">
                            {totalBF.toFixed(2)} BF
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {board.width}" × {board.thickness}" × {board.length}v (
                          {(lengthInInches / 12).toFixed(2)}') • {t('projects.qty')}:{' '}
                          {board.quantity}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {project.projectSheetGoods && project.projectSheetGoods.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, display: 'block', mb: 1 }}
          >
            {t('projects.sheetGoodsLabel')}:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {project?.projectSheetGoods?.map((projectSheetGood) => {
              return (
                <Chip
                  key={projectSheetGood.id}
                  label={`${projectSheetGood.sheetGood?.name || t('common.unknown')} (${projectSheetGood.quantity})`}
                  size="small"
                  sx={{
                    bgcolor: 'background.default',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {project.finishes && project.finishes.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, display: 'block', mb: 1 }}
          >
            {t('projects.finishes')}:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {project?.finishes?.map((finish) => {
              return (
                <Chip
                  key={finish.id}
                  label={finish?.name || 'Unknown'}
                  size="small"
                  sx={{
                    bgcolor: 'background.default',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {project.projectConsumables && project.projectConsumables.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, display: 'block', mb: 1 }}
          >
            {t('projects.consumablesLabel')}:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {project?.projectConsumables?.map((projectConsumable) => {
              return (
                <Chip
                  key={projectConsumable.id}
                  label={`${projectConsumable.consumable?.name || t('projects.unknownWood')} (${projectConsumable.quantity} ${t('projectDetails.items')})`}
                  size="small"
                  sx={{
                    bgcolor: 'background.default',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
