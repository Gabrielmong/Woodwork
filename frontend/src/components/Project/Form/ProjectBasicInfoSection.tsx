import { useTranslation } from 'react-i18next';
import { TextField, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { ProjectStatus } from '../../../types/project';

interface ProjectBasicInfoSectionProps {
  name: string;
  description: string;
  status: ProjectStatus;
  price: string;
  measurementUnit: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: ProjectStatus) => void;
  onPriceChange: (value: string) => void;
  onMeasurementUnitChange: (value: string) => void;
}

export function ProjectBasicInfoSection({
  name,
  description,
  status,
  price,
  measurementUnit,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onPriceChange,
  onMeasurementUnitChange,
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
          <MenuItem value={ProjectStatus.PRICE}>{t('project.status.price')}</MenuItem>
          <MenuItem value={ProjectStatus.PLANNED}>{t('project.status.planned')}</MenuItem>
          <MenuItem value={ProjectStatus.IN_PROGRESS}>{t('project.status.inProgress')}</MenuItem>
          <MenuItem value={ProjectStatus.FINISHING}>{t('project.status.finishing')}</MenuItem>
          <MenuItem value={ProjectStatus.COMPLETED}>{t('project.status.completed')}</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label={t('project.form.price')}
        placeholder={t('project.form.pricePlaceholder')}
        value={price}
        onChange={(e) => onPriceChange(e.target.value)}
        fullWidth
        type="number"
        variant="outlined"
        helperText={t('project.form.priceHelper')}
      />
      <FormControl fullWidth>
        <InputLabel>{t('project.form.measurementUnit')}</InputLabel>
        <Select
          value={measurementUnit}
          onChange={(e) => onMeasurementUnitChange(e.target.value)}
          label={t('project.form.measurementUnit')}
        >
          <MenuItem value="inches">{t('cutList.inches')}</MenuItem>
          <MenuItem value="cm">{t('cutList.cm')}</MenuItem>
          <MenuItem value="mm">{t('cutList.mm')}</MenuItem>
        </Select>
      </FormControl>
      <Divider />
    </>
  );
}
