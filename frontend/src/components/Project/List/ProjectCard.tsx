import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActions } from '@mui/material';
import type { Project } from '../../../types/project';
import { ProjectCardHeader } from './ProjectCardHeader';
import { ProjectCardMaterials } from './ProjectCardMaterials';
import { ProjectCardCostSummary } from './ProjectCardCostSummary';
import { ProjectCardActions } from './ProjectCardActions';

interface ProjectCardProps {
  project: Project;
  copiedId: string | null;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onShare: (e: React.MouseEvent, projectId: string) => void;
  onStatusChange?: (projectId: string, newStatus: any) => void;
}

export function ProjectCard({
  project,
  copiedId,
  onEdit,
  onDelete,
  onRestore,
  onShare,
  onStatusChange,
}: ProjectCardProps) {
  const navigate = useNavigate();

  const calculateProjectCost = () => {
    const boards = project.boards || [];
    const projectFinishes = project.projectFinishes || [];
    const projectSheetGoods = project.projectSheetGoods || [];
    const projectConsumables = project.projectConsumables || [];

    const materialCost = boards.reduce((total, board) => {
      const lumber = board.lumber;
      if (!lumber) return total;
      const lengthInInches = board.length * 33;
      const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
      const totalBF = boardFeet * board.quantity;
      return total + totalBF * lumber.costPerBoardFoot;
    }, 0);

    const finishCost = projectFinishes.reduce((total, projectFinish) => {
      const finish = projectFinish.finish;
      if (!finish) return total;
      const percentageDecimal = projectFinish.percentageUsed / 100;
      return total + finish.price * percentageDecimal * projectFinish.quantity;
    }, 0);

    const sheetGoodCost = projectSheetGoods.reduce((total, projectSheetGood) => {
      return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
    }, 0);

    const consumableCost = projectConsumables.reduce((total, projectConsumable) => {
      const consumable = projectConsumable.consumable;
      if (!consumable) return total;
      return total + projectConsumable.quantity * consumable.unitPrice;
    }, 0);

    return {
      materialCost,
      finishCost,
      sheetGoodCost,
      consumableCost,
      totalCost:
        materialCost +
        finishCost +
        sheetGoodCost +
        consumableCost +
        (project?.laborCost || 0) +
        (project?.miscCost || 0),
    };
  };

  const { materialCost, finishCost, sheetGoodCost, consumableCost, totalCost } =
    calculateProjectCost();

  return (
    <Card
      onClick={() => navigate(`/app/projects/${project.id}`)}
      sx={{
        opacity: project.isDeleted ? 0.6 : 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <ProjectCardHeader project={project} onStatusChange={onStatusChange} />

        <ProjectCardMaterials project={project} />

        <ProjectCardCostSummary
          project={project}
          materialCost={materialCost}
          finishCost={finishCost}
          sheetGoodCost={sheetGoodCost}
          consumableCost={consumableCost}
          totalCost={totalCost}
        />
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <ProjectCardActions
          project={project}
          copiedId={copiedId}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onShare={onShare}
        />
      </CardActions>
    </Card>
  );
}
