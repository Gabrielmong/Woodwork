import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { Box, Container, CircularProgress, Alert, Divider, Paper, Typography } from '@mui/material';
import { GET_SHARED_PROJECT } from '../graphql';
import type { SharedProject } from '../types/project';
import { CURRENCY_SYMBOLS } from '../types';
import { calculateTotalBoardFootage } from '../types/project';
import {
  ProjectBoardsSection,
  ProjectFinishesSection,
  ProjectSheetGoodsSection,
  ProjectConsumablesSection,
} from '../components/Project/Details';
import {
  SharedProjectHeader,
  SharedProjectInfo,
  SharedProjectCostSummary,
} from './SharedProject/components';

export default function SharedProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, loading, error } = useQuery(GET_SHARED_PROJECT, {
    variables: { id },
    skip: !id,
  });

  const project: SharedProject | undefined = data?.sharedProject;

  const currencySymbol = project
    ? CURRENCY_SYMBOLS[project.currency as keyof typeof CURRENCY_SYMBOLS] || CURRENCY_SYMBOLS.CRC
    : CURRENCY_SYMBOLS.CRC;

  const totalBoardFootage = project?.boards ? calculateTotalBoardFootage(project.boards) : 0;

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <SharedProjectHeader onGoToApp={() => navigate('/')} />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error">{t('shared.projectNotFound')}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <SharedProjectHeader onGoToApp={() => navigate('/')} />

      <Container maxWidth="lg" sx={{ py: 4, gap: 4, display: 'flex', flexDirection: 'column' }}>
        <SharedProjectInfo
          name={project.name}
          description={project.description}
          createdBy={project.createdBy}
          createdAt={project.createdAt}
          status={project.status}
          formatDate={formatDate}
        />
        <Divider />

        <SharedProjectCostSummary
          price={project.price}
          materialCost={project.materialCost}
          sheetGoodsCost={project.sheetGoodsCost}
          consumableCost={project.consumableCost}
          finishCost={project.finishCost}
          laborCost={project.laborCost}
          miscCost={project.miscCost}
          totalCost={project.totalCost}
          formatCurrency={formatCurrency}
        />
        <Divider />

        {project.additionalNotes && (
          <>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                {t('shared.additionalNotes')}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {project.additionalNotes}
              </Typography>
            </Paper>

            <Divider />
          </>
        )}

        {project.boards && project.boards.length > 0 && (
          <ProjectBoardsSection
            boards={project.boards}
            totalBoardFootage={totalBoardFootage}
            formatCurrency={formatCurrency}
          />
        )}

        <ProjectSheetGoodsSection
          projectSheetGoods={project.projectSheetGoods?.map((psg: any) => ({
            ...psg,
            sheetGood: psg.sheetGood,
          }))}
          formatCurrency={formatCurrency}
        />

        <ProjectFinishesSection
          projectFinishes={project.projectFinishes || []}
          formatCurrency={formatCurrency}
        />

        <ProjectConsumablesSection
          projectConsumables={project.projectConsumables?.map((pc: any) => ({
            ...pc,
            consumable: pc.consumable,
          }))}
          formatCurrency={formatCurrency}
        />
      </Container>
    </Box>
  );
}
