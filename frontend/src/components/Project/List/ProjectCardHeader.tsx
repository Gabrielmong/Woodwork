import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography, FormControl, Select, MenuItem, Chip, Divider } from '@mui/material';
import { ProjectStatus, type Project } from '../../../types/project';

const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface ProjectCardHeaderProps {
  project: Project;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

export function ProjectCardHeader({ project, onStatusChange }: ProjectCardHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <Stack spacing={2.5}>
        <Box>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 0.5,
                }}
              >
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {truncateText(project.description)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {!project.isDeleted && onStatusChange ? (
                <FormControl size="small" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={project.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      onStatusChange(project.id, e.target.value as ProjectStatus);
                    }}
                    size="small"
                    sx={{
                      minWidth: 130,
                      height: 32,
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
              ) : (
                project.isDeleted && <Chip label={t('common.deleted')} size="small" color="error" sx={{ height: 24 }} />
              )}
            </Stack>
          </Stack>
        </Box>

        <Divider />
      </Stack>
    </>
  );
}
