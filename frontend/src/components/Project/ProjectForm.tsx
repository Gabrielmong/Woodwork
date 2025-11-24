import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import type {
  Project,
  CreateProjectInput,
  CreateBoardInput,
  CreateProjectSheetGoodInput,
  CreateProjectConsumableInput,
  CreateProjectFinishInput,
} from '../../types/project';
import { ProjectStatus, calculateBoardFootage } from '../../types/project';
import type { Lumber } from '../../types/lumber';
import type { Finish } from '../../types/finish';
import type { SheetGood } from '../../types/sheetGood';
import type { Consumable } from '../../types/consumable';
import { useCurrency } from '../../utils/currency';
import {
  ProjectBasicInfoSection,
  ProjectBoardsFormSection,
  ProjectFinishesFormSection,
  ProjectSheetGoodsFormSection,
  ProjectConsumablesFormSection,
  ProjectCostsSection,
} from './Form';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: CreateProjectInput) => void;
  editingProject?: Project | null;
  lumberOptions: Lumber[];
  finishOptions: Finish[];
  sheetGoodOptions: SheetGood[];
  consumableOptions: Consumable[];
}

export function ProjectForm({
  open,
  onClose,
  onSubmit,
  editingProject,
  lumberOptions,
  finishOptions,
  sheetGoodOptions,
  consumableOptions,
}: ProjectFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PRICE);
  const [price, setPrice] = useState('');
  const [boards, setBoards] = useState<CreateBoardInput[]>([]);
  const [projectFinishes, setProjectFinishes] = useState<CreateProjectFinishInput[]>([]);
  const [projectSheetGoods, setProjectSheetGoods] = useState<CreateProjectSheetGoodInput[]>([]);
  const [projectConsumables, setProjectConsumables] = useState<CreateProjectConsumableInput[]>([]);
  const [laborCost, setLaborCost] = useState('');
  const [miscCost, setMiscCost] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const formatCurrency = useCurrency();

  // Calculate total cost in real-time
  const totalCost = useMemo(() => {
    // Calculate board costs
    const boardCost = boards.reduce((total, board) => {
      const lumber = lumberOptions.find((l) => l.id === board.lumberId);
      if (!lumber) return total;
      const boardFeet = calculateBoardFootage({
        id: '',
        ...board,
        boardFeet: 0,
      });
      return total + boardFeet * lumber.costPerBoardFoot;
    }, 0);

    // Calculate sheet good costs
    const sheetGoodCost = projectSheetGoods.reduce((total, psg) => {
      const sheetGood = sheetGoodOptions.find((sg) => sg.id === psg.sheetGoodId);
      if (!sheetGood) return total;
      return total + sheetGood.price * psg.quantity;
    }, 0);

    // Calculate consumable costs (charged by unit)
    const consumableCost = projectConsumables.reduce((total, pc) => {
      const consumable = consumableOptions.find((c) => c.id === pc.consumableId);
      if (!consumable) return total;
      return total + pc.quantity * consumable.unitPrice;
    }, 0);

    // Calculate finish costs (with percentage)
    const finishCost = projectFinishes.reduce((total, pf) => {
      const finish = finishOptions.find((f) => f.id === pf.finishId);
      if (!finish) return total;
      const percentageDecimal = pf.percentageUsed / 100;
      return total + finish.price * percentageDecimal;
    }, 0);

    // Add labor and misc costs
    const labor = parseFloat(laborCost) || 0;
    const misc = parseFloat(miscCost) || 0;

    return boardCost + sheetGoodCost + consumableCost + finishCost + labor + misc;
  }, [
    boards,
    projectSheetGoods,
    projectConsumables,
    projectFinishes,
    laborCost,
    miscCost,
    lumberOptions,
    sheetGoodOptions,
    consumableOptions,
    finishOptions,
  ]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus(ProjectStatus.PRICE);
    setPrice('');
    setBoards([]);
    setProjectFinishes([]);
    setProjectSheetGoods([]);
    setProjectConsumables([]);
    setLaborCost('');
    setMiscCost('');
    setAdditionalNotes('');
  };

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description);
      setStatus(editingProject.status);
      setPrice(editingProject.price.toString());
      const cleanBoards =
        editingProject.boards?.map((board) => ({
          width: board.width,
          thickness: board.thickness,
          length: board.length,
          quantity: board.quantity,
          lumberId: board.lumberId,
        })) || [];
      setBoards(cleanBoards);
      const projectFinishesFromProject =
        editingProject.projectFinishes?.map((pf) => ({
          finishId: pf.finishId,
          quantity: pf.quantity,
          percentageUsed: pf.percentageUsed,
        })) || [];
      setProjectFinishes(projectFinishesFromProject);
      const projectSheetGoodsFromProject =
        editingProject.projectSheetGoods?.map((psg) => ({
          quantity: psg.quantity,
          sheetGoodId: psg.sheetGoodId,
        })) || [];
      setProjectSheetGoods(projectSheetGoodsFromProject);
      const projectConsumablesFromProject =
        editingProject.projectConsumables?.map((pc) => ({
          quantity: pc.quantity,
          consumableId: pc.consumableId,
        })) || [];
      setProjectConsumables(projectConsumablesFromProject);
      setLaborCost(editingProject.laborCost.toString());
      setMiscCost(editingProject.miscCost.toString());
      setAdditionalNotes(editingProject.additionalNotes || '');
    } else {
      resetForm();
    }
  }, [editingProject, open]);

  const handleAddBoard = () => {
    const newBoard: CreateBoardInput = {
      width: 0,
      thickness: 0,
      length: 0,
      quantity: 1,
      lumberId: lumberOptions[0]?.id || '',
    };
    setBoards([...boards, newBoard]);
  };

  const handleBoardChange = (index: number, board: CreateBoardInput) => {
    const updatedBoards = [...boards];
    updatedBoards[index] = board;
    setBoards(updatedBoards);
  };

  const handleRemoveBoard = (index: number) => {
    setBoards(boards.filter((_, i) => i !== index));
  };

  const handleAddSheetGood = () => {
    const newSheetGood: CreateProjectSheetGoodInput = {
      quantity: 1,
      sheetGoodId: sheetGoodOptions[0]?.id || '',
    };
    setProjectSheetGoods([...projectSheetGoods, newSheetGood]);
  };

  const handleSheetGoodChange = (index: number, projectSheetGood: CreateProjectSheetGoodInput) => {
    const updatedSheetGoods = [...projectSheetGoods];
    updatedSheetGoods[index] = projectSheetGood;
    setProjectSheetGoods(updatedSheetGoods);
  };

  const handleRemoveSheetGood = (index: number) => {
    setProjectSheetGoods(projectSheetGoods.filter((_, i) => i !== index));
  };

  const handleAddConsumable = () => {
    const newConsumable: CreateProjectConsumableInput = {
      quantity: 1,
      consumableId: consumableOptions[0]?.id || '',
    };
    setProjectConsumables([...projectConsumables, newConsumable]);
  };

  const handleConsumableChange = (
    index: number,
    projectConsumable: CreateProjectConsumableInput
  ) => {
    const updatedConsumables = [...projectConsumables];
    updatedConsumables[index] = projectConsumable;
    setProjectConsumables(updatedConsumables);
  };

  const handleRemoveConsumable = (index: number) => {
    setProjectConsumables(projectConsumables.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const projectData: CreateProjectInput = {
      name,
      description,
      status,
      price: parseFloat(price) || 0,
      boards,
      projectFinishes,
      projectSheetGoods,
      projectConsumables,
      laborCost: parseFloat(laborCost) || 0,
      miscCost: parseFloat(miscCost) || 0,
      additionalNotes: additionalNotes.trim() || undefined,
    };
    onSubmit(projectData);
    resetForm();
    onClose();
  };

  const isValid =
    name.trim() &&
    description.trim() &&
    // If boards exist, they must all be valid
    (boards.length === 0 ||
      boards.every(
        (b) => b.width > 0 && b.thickness > 0 && b.length > 0 && b.quantity > 0 && b.lumberId
      )) &&
    // If sheet goods exist, they must all be valid
    (projectSheetGoods.length === 0 ||
      projectSheetGoods.every((sg) => sg.quantity > 0 && sg.sheetGoodId)) &&
    // If consumables exist, they must all be valid
    (projectConsumables.length === 0 ||
      projectConsumables.every((pc) => pc.quantity > 0 && pc.consumableId));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0px 20px 40px rgba(50, 50, 93, 0.15), 0px 12px 24px rgba(0, 0, 0, 0.12)',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 4,
          pt: 4,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {editingProject ? t('project.form.editProject') : t('project.form.createNewProject')}
        </Typography>
        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'success.main',
            bgcolor: 'rgba(34, 197, 94, 0.08)',
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
        >
          {t('project.form.total')}: {formatCurrency(totalCost)}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <ProjectBasicInfoSection
            name={name}
            description={description}
            status={status}
            price={price}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onStatusChange={setStatus}
            onPriceChange={setPrice}
          />

          <ProjectBoardsFormSection
            boards={boards}
            lumberOptions={lumberOptions}
            onAddBoard={handleAddBoard}
            onBoardChange={handleBoardChange}
            onRemoveBoard={handleRemoveBoard}
          />

          <ProjectSheetGoodsFormSection
            projectSheetGoods={projectSheetGoods}
            sheetGoodOptions={sheetGoodOptions}
            onAddSheetGood={handleAddSheetGood}
            onSheetGoodChange={handleSheetGoodChange}
            onRemoveSheetGood={handleRemoveSheetGood}
          />

          <ProjectConsumablesFormSection
            projectConsumables={projectConsumables}
            consumableOptions={consumableOptions}
            onAddConsumable={handleAddConsumable}
            onConsumableChange={handleConsumableChange}
            onRemoveConsumable={handleRemoveConsumable}
          />

          <ProjectFinishesFormSection
            projectFinishes={projectFinishes}
            finishOptions={finishOptions}
            onProjectFinishesChange={setProjectFinishes}
          />

          <ProjectCostsSection
            laborCost={laborCost}
            miscCost={miscCost}
            additionalNotes={additionalNotes}
            onLaborCostChange={setLaborCost}
            onMiscCostChange={setMiscCost}
            onAdditionalNotesChange={setAdditionalNotes}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 4, pt: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          {t('project.form.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={!isValid}
          sx={{
            background: isValid ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : undefined,
            px: 4,
            '&:hover': {
              background: isValid ? 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)' : undefined,
            },
          }}
        >
          {editingProject ? t('project.form.updateProject') : t('project.form.createProject')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
