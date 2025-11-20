import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type { Project } from '../../../types/project';

interface ProjectCardActionsProps {
  project: Project;
  copiedId: string | null;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onShare: (e: React.MouseEvent, projectId: string) => void;
}

export function ProjectCardActions({
  project,
  copiedId,
  onEdit,
  onDelete,
  onRestore,
  onShare,
}: ProjectCardActionsProps) {
  const { t } = useTranslation();

  if (project.isDeleted) {
    return (
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onRestore(project.id);
        }}
        aria-label="restore"
        sx={{
          color: 'success.main',
          bgcolor: 'rgba(0, 217, 36, 0.08)',
          '&:hover': {
            bgcolor: 'rgba(0, 217, 36, 0.15)',
          },
        }}
      >
        <RestoreIcon fontSize="small" />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton
        onClick={(e) => onShare(e, project.id)}
        aria-label="share"
        sx={{
          color: copiedId === project.id ? 'success.main' : 'info.main',
          bgcolor:
            copiedId === project.id ? 'rgba(46, 125, 50, 0.08)' : 'rgba(2, 136, 209, 0.08)',
          '&:hover': {
            bgcolor:
              copiedId === project.id ? 'rgba(46, 125, 50, 0.15)' : 'rgba(2, 136, 209, 0.15)',
          },
        }}
        title={copiedId === project.id ? t('projects.linkCopied') : t('projects.copyShareLink')}
      >
        {copiedId === project.id ? (
          <ContentCopyIcon fontSize="small" />
        ) : (
          <ShareIcon fontSize="small" />
        )}
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit(project);
        }}
        aria-label="edit"
        sx={{
          color: 'primary.main',
          bgcolor: 'rgba(99, 91, 255, 0.08)',
          '&:hover': {
            bgcolor: 'rgba(99, 91, 255, 0.15)',
          },
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id);
        }}
        aria-label="delete"
        sx={{
          color: 'error.main',
          bgcolor: 'rgba(223, 27, 65, 0.08)',
          '&:hover': {
            bgcolor: 'rgba(223, 27, 65, 0.15)',
          },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </>
  );
}
