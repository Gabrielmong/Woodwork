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
  Badge,
  useMediaQuery,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { ProjectStatus } from '../../../types/project';

interface ProjectHeaderProps {
  projectName: string;
  projectDescription: string;
  projectStatus: ProjectStatus;
  copySuccess: boolean;
  cutListCompletion: number;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onStatusChange: (status: ProjectStatus) => void;
  onCutList: () => void;
}

export function ProjectHeader({
  projectName,
  projectDescription,
  projectStatus,
  copySuccess,
  cutListCompletion,
  onBack,
  onEdit,
  onDelete,
  onShare,
  onStatusChange,
  onCutList,
}: ProjectHeaderProps) {
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));
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
        gap={2}
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

        <Stack
          direction={isMobile ? 'column' : 'row'}
          gap={2}
          alignItems={isMobile ? 'flex-start' : 'center'}
          justifyContent={isMobile ? 'flex-start' : 'flex-end'}
          width={isMobile ? '100%' : '33%'}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              paddingRight: isMobile ? 0 : 2,
            }}
          >
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

            <Badge
              badgeContent={`${cutListCompletion}%`}
              color={cutListCompletion === 100 ? 'success' : 'primary'}
            >
              <Button
                onClick={onCutList}
                startIcon={<ListAltIcon />}
                sx={{
                  color: 'primary.main',
                  bgcolor: 'rgba(99, 91, 255, 0.08)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: 'rgba(99, 91, 255, 0.15)',
                  },
                }}
              >
                {t('cutList.title')}
              </Button>
            </Badge>
          </Box>

          <Divider orientation={isMobile ? 'horizontal' : 'vertical'} flexItem />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <IconButton
              onClick={onShare}
              sx={{
                color: copySuccess ? 'success.main' : 'info.main',
                bgcolor: copySuccess ? 'rgba(46, 125, 50, 0.08)' : 'rgba(2, 136, 209, 0.08)',
                '&:hover': {
                  bgcolor: copySuccess ? 'rgba(46, 125, 50, 0.15)' : 'rgba(2, 136, 209, 0.15)',
                },
              }}
              title={
                copySuccess ? t('projectDetails.linkCopied') : t('projectDetails.copyShareLink')
              }
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
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
