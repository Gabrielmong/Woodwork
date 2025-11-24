import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Paper,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ArrowDownward } from '@mui/icons-material';
import { VARA_TO_INCHES, type Board } from '../../../types/project';

interface ProjectBoardsSectionProps {
  boards: Board[];
  totalBoardFootage: number;
  formatCurrency: (amount: number) => string;
}

export function ProjectBoardsSection({
  boards,
  totalBoardFootage,
  formatCurrency,
}: ProjectBoardsSectionProps) {
  const { t } = useTranslation();

  if (!boards || boards.length === 0) {
    return null;
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('projectDetails.materials')} ({totalBoardFootage.toFixed(2)}{' '}
          {t('projectDetails.bfTotal')})
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
            <Stack spacing={2}>
              {boards.map((board: any, idx: number) => {
                const lumber = board.lumber;
                const lengthInInches = board.length * VARA_TO_INCHES;
                const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
                const totalBF = boardFeet * board.quantity;
                const cost = lumber ? totalBF * lumber.costPerBoardFoot : 0;

                return (
                  <Paper
                    key={idx}
                    sx={{
                      p: 2.5,
                      bgcolor: 'rgba(99, 91, 255, 0.03)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
                          >
                            {lumber?.name || t('projectDetails.unknownWood')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {board.width}" × {board.thickness}" × {board.length} varas (
                            {(lengthInInches / 12).toFixed(2)}')
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('projectDetails.quantity')}: {board.quantity}{' '}
                            {t('projectDetails.boards')}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('projectDetails.boardFeet')}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {totalBF.toFixed(2)} BF
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box>
                        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('projectDetails.costPerBF')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {lumber ? formatCurrency(lumber.costPerBoardFoot) : 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('projectDetails.jankaRating')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {lumber?.jankaRating?.toLocaleString() || 'N/A'} lbf
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('projectDetails.materialCost')}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: 'success.main' }}
                            >
                              {formatCurrency(cost)}
                            </Typography>
                          </Box>
                        </Stack>

                        {lumber && lumber?.tags?.length > 0 && (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mb: 0.5 }}
                            >
                              {t('projectDetails.goodFor')}
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                              {lumber.tags.map((tag: string, tagIdx: number) => (
                                <Chip
                                  key={tagIdx}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    bgcolor: 'background.default',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}
