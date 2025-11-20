import { useTranslation } from 'react-i18next';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { ProjectStatus } from '../../../types/project';

interface ProjectBasicInfoSectionProps {
  name: string;
  description: string;
  status: ProjectStatus;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: ProjectStatus) => void;
}

export function ProjectBasicInfoSection({
  name,
  description,
  status,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
}: ProjectBasicInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <TextField
        label={t('project.form.projectNameLabel')}
        placeholder={t('project.form.projectNamePlaceholderAlt')}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        fullWidth
        required
        variant="outlined"
      />
      <TextField
        label={t('project.form.descriptionLabel')}
        placeholder={t('project.form.descriptionPlaceholderAlt')}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        fullWidth
        multiline
        rows={2}
        required
        variant="outlined"
      />
      <FormControl fullWidth required>
        <InputLabel>{t('project.form.statusLabel')}</InputLabel>
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
          label={t('project.form.statusLabel')}
        >
          <MenuItem value={ProjectStatus.PLANNED}>{t('project.status.planned')}</MenuItem>
          <MenuItem value={ProjectStatus.IN_PROGRESS}>{t('project.status.inProgress')}</MenuItem>
          <MenuItem value={ProjectStatus.FINISHING}>{t('project.status.finishing')}</MenuItem>
          <MenuItem value={ProjectStatus.COMPLETED}>{t('project.status.completed')}</MenuItem>
        </Select>
      </FormControl>
      <Divider />
    </>
  );
}
