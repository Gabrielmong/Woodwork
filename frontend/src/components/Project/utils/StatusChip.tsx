import { Chip } from '@mui/material';
import { ProjectStatus } from '../../../types';
import { useTranslation } from 'react-i18next';

export const StatusChip = ({ status }: { status: ProjectStatus }) => {
  const { t } = useTranslation();

  switch (status) {
    case ProjectStatus.PLANNED:
      return <Chip label={t('project.status.planned')} size="small" color="default" />;
    case ProjectStatus.IN_PROGRESS:
      return <Chip label={t('project.status.inProgress')} size="small" color="info" />;
    case ProjectStatus.FINISHING:
      return <Chip label={t('project.status.finishing')} size="small" color="warning" />;
    case ProjectStatus.COMPLETED:
      return <Chip label={t('project.status.completed')} size="small" color="success" />;
    default:
      return <Chip label={status} size="small" color="default" />;
  }
};
