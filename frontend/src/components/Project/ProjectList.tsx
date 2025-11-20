import React from 'react';
import { Grid, Snackbar } from '@mui/material';
import type { Project } from '../../types/project';
import { ProjectStatus } from '../../types/project';
import { useTranslation } from 'react-i18next';
import { ProjectCard } from './List';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

export function ProjectList({
  projects,
  onEdit,
  onDelete,
  onRestore,
  onStatusChange,
}: ProjectListProps) {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/shared/${projectId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(projectId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Grid container spacing={3}>
      <Snackbar
        open={copiedId !== null}
        message={t('common.linkCopied')}
        autoHideDuration={4000}
        onClose={() => setCopiedId(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      {projects.map((project) => (
        <Grid size={{ xs: 12, lg: 4 }} key={project.id}>
          <ProjectCard
            project={project}
            copiedId={copiedId}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onShare={handleShare}
            onStatusChange={onStatusChange}
          />
        </Grid>
      ))}
    </Grid>
  );
}
