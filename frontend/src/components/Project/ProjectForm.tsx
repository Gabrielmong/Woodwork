import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type {
  Project,
  CreateProjectInput,
  CreateBoardInput,
  CreateProjectSheetGoodInput,
} from '../../types/project';
import { ProjectStatus, calculateBoardFootage } from '../../types/project';
import type { Lumber } from '../../types/lumber';
import type { Finish } from '../../types/finish';
import type { SheetGood } from '../../types/sheetGood';
import BoardInput from '../Lumber/BoardInput';
import SheetGoodInput from '../SheetGood/SheetGoodInput';
import { useCurrency } from '../../utils/currency';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: CreateProjectInput) => void;
  editingProject?: Project | null;
  lumberOptions: Lumber[];
  finishOptions: Finish[];
  sheetGoodOptions: SheetGood[];
}

export function ProjectForm({
  open,
  onClose,
  onSubmit,
  editingProject,
  lumberOptions,
  finishOptions,
  sheetGoodOptions,
}: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PLANNED);
  const [boards, setBoards] = useState<CreateBoardInput[]>([]);
  const [finishIds, setFinishIds] = useState<string[]>([]);
  const [projectSheetGoods, setProjectSheetGoods] = useState<CreateProjectSheetGoodInput[]>([]);
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

    // Calculate finish costs
    const finishCost = finishIds.reduce((total, finishId) => {
      const finish = finishOptions.find((f) => f.id === finishId);
      if (!finish) return total;
      return total + finish.price;
    }, 0);

    // Add labor and misc costs
    const labor = parseFloat(laborCost) || 0;
    const misc = parseFloat(miscCost) || 0;

    return boardCost + sheetGoodCost + finishCost + labor + misc;
  }, [boards, projectSheetGoods, finishIds, laborCost, miscCost, lumberOptions, sheetGoodOptions, finishOptions]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus(ProjectStatus.PLANNED);
    setBoards([]);
    setFinishIds([]);
    setProjectSheetGoods([]);
    setLaborCost('');
    setMiscCost('');
    setAdditionalNotes('');
  };

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description);
      setStatus(editingProject.status);
      const cleanBoards =
        editingProject.boards?.map((board) => ({
          width: board.width,
          thickness: board.thickness,
          length: board.length,
          quantity: board.quantity,
          lumberId: board.lumberId,
        })) || [];
      setBoards(cleanBoards);
      const finishIdsFromProject = editingProject?.finishes?.map((finish) => finish.id);
      setFinishIds(finishIdsFromProject || []);
      const projectSheetGoodsFromProject =
        editingProject.projectSheetGoods?.map((psg) => ({
          quantity: psg.quantity,
          sheetGoodId: psg.sheetGoodId,
        })) || [];
      setProjectSheetGoods(projectSheetGoodsFromProject);
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

  const handleSubmit = () => {
    const projectData: CreateProjectInput = {
      name,
      description,
      status,
      boards,
      finishIds,
      projectSheetGoods,
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
      projectSheetGoods.every((sg) => sg.quantity > 0 && sg.sheetGoodId));

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
          {editingProject ? 'Edit Project' : 'Create New Project'}
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
          Total: {formatCurrency(totalCost)}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Project Details */}
          <TextField
            label="Project Name"
            placeholder="e.g., Kitchen Cabinets"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Description"
            placeholder="Describe the project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            required
            variant="outlined"
          />
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              label="Status"
            >
              <MenuItem value={ProjectStatus.PLANNED}>Planned</MenuItem>
              <MenuItem value={ProjectStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={ProjectStatus.FINISHING}>Finishing</MenuItem>
              <MenuItem value={ProjectStatus.COMPLETED}>Completed</MenuItem>
            </Select>
          </FormControl>
          <Divider />
          {/* Boards Section */}
          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Boards
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddBoard}
                disabled={lumberOptions.length === 0}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'rgba(99, 91, 255, 0.08)',
                  },
                }}
              >
                Add Board
              </Button>
            </Box>

            {boards.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.default',
                }}
              >
                <Typography color="text.secondary">
                  No boards added yet. Click "Add Board" to get started.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {boards.map((board, index) => (
                  <BoardInput
                    key={index}
                    board={board}
                    index={index}
                    lumberOptions={lumberOptions}
                    onChange={handleBoardChange}
                    onRemove={handleRemoveBoard}
                  />
                ))}
              </Stack>
            )}
          </Box>
          <Divider /> {/* Sheet Goods Section */}
          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Sheet Goods
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddSheetGood}
                disabled={sheetGoodOptions.length === 0}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'rgba(99, 91, 255, 0.08)',
                  },
                }}
              >
                Add Sheet Good
              </Button>
            </Box>

            {projectSheetGoods.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No sheet goods added yet. Click "Add Sheet Good" to get started.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {projectSheetGoods.map((projectSheetGood, index) => (
                  <SheetGoodInput
                    key={index}
                    projectSheetGood={projectSheetGood}
                    index={index}
                    sheetGoodOptions={sheetGoodOptions}
                    onChange={handleSheetGoodChange}
                    onRemove={handleRemoveSheetGood}
                  />
                ))}
              </Stack>
            )}
          </Box>
          <Divider /> {/* Sheet Goods Section */}
          {/* Finishes Section */}
          <FormControl fullWidth>
            <InputLabel>Finishes (optional)</InputLabel>
            <Select
              multiple
              value={finishIds}
              onChange={(e) =>
                setFinishIds(
                  typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                )
              }
              input={<OutlinedInput label="Finishes (optional)" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const finish = finishOptions.find((f) => f.id === id);
                    return (
                      <Chip
                        key={id}
                        label={finish?.name || id}
                        size="small"
                        sx={{ bgcolor: 'background.default' }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {finishOptions.map((finish) => (
                <MenuItem key={finish.id} value={finish.id}>
                  {finish.name} - ₡{finish.price.toFixed(2)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider />
          {/* Costs Section */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Additional Costs
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Labor Cost (₡)"
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  inputProps={{ step: '0.01', min: '0' }}
                  fullWidth
                />
                <TextField
                  label="Miscellaneous Cost (₡)"
                  type="number"
                  value={miscCost}
                  onChange={(e) => setMiscCost(e.target.value)}
                  inputProps={{ step: '0.01', min: '0' }}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Additional Notes"
                placeholder="Hardware, shipping, etc..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
            </Stack>
          </Box>
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
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={!isValid}
          sx={{
            background: isValid ? 'linear-gradient(135deg, #635BFF 0%, #7A73FF 100%)' : undefined,
            px: 4,
            '&:hover': {
              background: isValid ? 'linear-gradient(135deg, #4D47CC 0%, #635BFF 100%)' : undefined,
            },
          }}
        >
          {editingProject ? 'Update Project' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
