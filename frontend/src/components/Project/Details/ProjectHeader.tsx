import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ProjectStatus } from '../../../types/project';

interface ProjectHeaderProps {
  projectName: string;
  projectDescription: string;
  projectStatus: ProjectStatus;
  copySuccess: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onStatusChange: (status: ProjectStatus) => void;
}

export function ProjectHeader({
  projectName,
  projectDescription,
  projectStatus,
  copySuccess,
  onBack,
  onEdit,
  onDelete,
  onShare,
  onStatusChange,
}: ProjectHeaderProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 3 }}>
        {t('projectDetails.backToProjects')}
      </Button>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' },
            }}
          >
            {projectName}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem', lg: '1.125rem' },
              mt: 1,
            }}
          >
            {projectDescription}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              value={projectStatus}
              onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
              label={t('common.status')}
              size="small"
            >
              <MenuItem value={ProjectStatus.PRICE}>
                <Chip
                  label={t('project.status.price')}
                  size="small"
                  color="default"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
              </MenuItem>
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
          <IconButton
            onClick={onShare}
            sx={{
              color: copySuccess ? 'success.main' : 'info.main',
              bgcolor: copySuccess ? 'rgba(46, 125, 50, 0.08)' : 'rgba(2, 136, 209, 0.08)',
              '&:hover': {
                bgcolor: copySuccess ? 'rgba(46, 125, 50, 0.15)' : 'rgba(2, 136, 209, 0.15)',
              },
            }}
            title={copySuccess ? t('projectDetails.linkCopied') : t('projectDetails.copyShareLink')}
          >
            {copySuccess ? <ContentCopyIcon /> : <ShareIcon />}
          </IconButton>
          <IconButton
            onClick={onEdit}
            sx={{
              color: 'primary.main',
              bgcolor: 'rgba(99, 91, 255, 0.08)',
              '&:hover': {
                bgcolor: 'rgba(99, 91, 255, 0.15)',
              },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={onDelete}
            sx={{
              color: 'error.main',
              bgcolor: 'rgba(223, 27, 65, 0.08)',
              '&:hover': {
                bgcolor: 'rgba(223, 27, 65, 0.15)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
