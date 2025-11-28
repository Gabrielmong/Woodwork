# Implementation Guide

## Overview

This guide covers the major features and implementation patterns in the Lumber Calculator application.

## Table of Contents

1. [Project Price & Finish Percentage System](#project-price--finish-percentage-system)
2. [Currency & Language Settings](#currency--language-settings)
3. [Cost Calculations](#cost-calculations)
4. [Component Patterns](#component-patterns)

## Currency Implementation

### Using the Currency Hook

Import and use the `useCurrency` hook in any component:

```tsx
import { useCurrency } from '../utils/currency';

export default function MyComponent() {
  const formatCurrency = useCurrency();

  const price = 1250.5;

  return <Typography>Price: {formatCurrency(price)}</Typography>;
}
```

### Components That Need Currency Updates

Replace all hardcoded `₡` symbols with the currency hook:

**Lumber Components:**

- `LumberList.tsx` - Line 106 (costPerBoardFoot display)
- `LumberTable.tsx` - Line 64 (costPerBoardFoot cell)
- `LumberForm.tsx` - Label "Cost per Board Foot (₡)" → use translation
- `BoardInput.tsx` - Lines 87, 161 (lumber dropdown and cost display)

**Finish Components:**

- `FinishList.tsx` - Line 103 (price display)
- `FinishTable.tsx` - Line 74 (price cell)
- `FinishForm.tsx` - Label "Price (₡)" → use translation, Line 255 (finish dropdown)

**Project Components:**

- `ProjectList.tsx` - Lines 181, 190, 200, 210, 228 (all cost displays)
- `ProjectTable.tsx` - Line 137 (totalCost cell)
- `ProjectForm.tsx` - Lines 271, 279 (labor and misc cost labels)

### Example Implementation

**Before:**

```tsx
<Typography>₡{item.price.toFixed(2)}</Typography>
```

**After:**

```tsx
import { useCurrency } from '../utils/currency';

const formatCurrency = useCurrency();

<Typography>{formatCurrency(item.price)}</Typography>;
```

## Translation Implementation

### Using Translations

Import and use the `useTranslation` hook:

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return <Typography variant="h3">{t('lumber.title')}</Typography>;
}
```

### Translation Keys Reference

See `src/i18n/en.json` and `src/i18n/es.json` for all available keys:

- `app.title` - App name
- `nav.*` - Navigation items
- `lumber.*` - Lumber page strings
- `finishes.*` - Finishes page strings
- `projects.*` - Projects page strings
- `settings.*` - Settings page strings
- `common.*` - Shared strings (edit, delete, cancel, etc.)

### Components That Need Translation Updates

**ViewLayout.tsx:**

```tsx
// Add at top
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Replace hardcoded strings
<Button>{t('common.create')}</Button>
<Button>{t('common.showDeleted')}</Button>
```

**LumberTab.tsx:**

```tsx
<ViewLayout
  title={t('lumber.title')}
  subtitle={t('lumber.subtitle')}
  addButtonText={t('lumber.add')}
  emptyTitle={t('lumber.emptyTitle')}
  emptySubtitle={t('lumber.emptySubtitle')}
  // ...
/>
```

**Settings.tsx:**
Already implemented - reference example for other components.

## Testing

1. **Currency Switching:**
   - Go to Settings
   - Change Currency between CRC and USD
   - Navigate to Lumber/Finishes/Projects
   - Verify all prices show correct symbol

2. **Language Switching:**
   - Go to Settings
   - Change Language between English and Español
   - Navigate through all pages
   - Verify all UI text is translated

## Adding New Translations

1. Add key to `src/i18n/en.json`
2. Add Spanish translation to `src/i18n/es.json`
3. Use in component with `t('your.new.key')`

## Status

✅ **Completed:**

- Currency hook (`useCurrency`)
- i18next setup
- Translation files (EN/ES)
- Language sync with Redux
- Sidebar fully translated
- Settings page fully translated

✅ **Completed:**

- All components updated to use `useCurrency()` hook
- All components updated to use `t()` translation function
- All pages tested in both languages and currencies

---

## Project Price & Finish Percentage System

### Overview

Projects now support:

1. **Price Field** - Store quoted price (cotización) for projects
2. **Finish Percentage** - Track partial usage of finish products (1-100%)

### Database Schema

#### Project Model Changes

```prisma
model Project {
  id              String   @id @default(uuid())
  price           Float    @default(0)  // NEW: Quoted price
  projectFinishes ProjectFinish[]       // CHANGED: From implicit to explicit
  // ... other fields
}
```

#### New ProjectFinish Join Table

```prisma
model ProjectFinish {
  id             String   @id @default(uuid())
  percentageUsed Float    @default(100)  // NEW: 1-100%
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  finishId       String
  finish         Finish   @relation(fields: [finishId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([projectId, finishId])
  @@map("project_finishes")
}
```

### GraphQL Schema

```graphql
type ProjectFinish {
  id: ID!
  percentageUsed: Float!
  finish: Finish!
  finishId: String!
  createdAt: String!
  updatedAt: String!
}

type Project {
  id: ID!
  price: Float!
  projectFinishes: [ProjectFinish!]!
  # ... other fields
}

input ProjectFinishInput {
  finishId: String!
  percentageUsed: Float!
}

input CreateProjectInput {
  price: Float
  projectFinishes: [ProjectFinishInput!]
  # ... other fields
}
```

### Frontend Types

```typescript
// src/types/project.ts

export interface ProjectFinish {
  id: string;
  percentageUsed: number;
  finishId: string;
  finish?: {
    id: string;
    name: string;
    price: number;
    // ... other fields
  };
}

export interface CreateProjectFinishInput {
  finishId: string;
  percentageUsed: number;
}

export interface Project {
  id: string;
  price: number;
  projectFinishes?: ProjectFinish[];
  // ... other fields
}
```

### Cost Calculation Pattern

All finish cost calculations use this formula:

```typescript
const finishCost = projectFinishes.reduce((total, projectFinish) => {
  const finish = projectFinish.finish;
  if (!finish) return total;
  const percentageDecimal = projectFinish.percentageUsed / 100;
  return total + finish.price * percentageDecimal;
}, 0);
```

**Key Files Using This Pattern:**

- `frontend/src/components/Project/ProjectDetails.tsx` (line 130-135)
- `frontend/src/components/Project/List/ProjectCard.tsx` (line 46-51)
- `frontend/src/components/Project/ProjectTable.tsx` (line 68-72)
- `backend/src/resolvers/projectResolvers.ts` (finishCost resolver)
- `backend/src/resolvers/dashboardResolvers.ts` (stats calculation)

### UI Components

#### ProjectFinishesFormSection.tsx

Creates/edits project finishes with percentage controls:

```tsx
// Key features:
// - Dropdown to select finish
// - Slider for percentage (1-100%)
// - Real-time cost preview
// - Add/remove finish entries
// - Prevents duplicate finish selection

<Paper>
  <Select
    value={projectFinish.finishId}
    onChange={(e) => handleFinishChange(index, e.target.value)}
  >
    {finishOptions.map((finish) => (
      <MenuItem value={finish.id} disabled={isFinishDisabled(finish.id, index)}>
        {finish.name}
      </MenuItem>
    ))}
  </Select>

  <Slider
    value={projectFinish.percentageUsed}
    onChange={(e, value) => handlePercentageChange(index, value as number)}
    min={1}
    max={100}
    valueLabelDisplay="auto"
  />

  <Typography>
    {formatCurrency(cost)} ({projectFinish.percentageUsed}%)
  </Typography>
</Paper>
```

#### ProjectFinishesSection.tsx

Displays finishes in project details:

```tsx
// Key features:
// - Shows percentage badge
// - Displays strikethrough full price
// - Shows adjusted cost

<Chip
  label={`${projectFinish.percentageUsed}% ${t('finishes.percentageUsed')}`}
  size="small"
/>
<Typography sx={{ textDecoration: 'line-through' }}>
  {formatCurrency(finish.price)}
</Typography>
<Typography variant="h6">
  {formatCurrency(cost)}
</Typography>
```

### Translation Keys

```json
// en.json
{
  "project": {
    "form": {
      "price": "Quote Price",
      "priceHelper": "The quoted price for this project",
      "pricePlaceholder": "e.g., 1500.00"
    }
  },
  "finishes": {
    "percentageUsed": "Percentage Used",
    "percentageHelper": "Percentage of the finish product used in the project"
  }
}

// es.json
{
  "project": {
    "form": {
      "price": "Precio de Cotización",
      "priceHelper": "El precio cotizado para este proyecto",
      "pricePlaceholder": "ej., 1500.00"
    }
  },
  "finishes": {
    "percentageUsed": "Porcentaje Usado",
    "percentageHelper": "Porcentaje del producto de acabado usado en el proyecto"
  }
}
```

### Migration Notes

**Breaking Change:** The Project-Finish relationship changed from implicit to explicit.

**Migration Path:**

1. Data was migrated from `_ProjectFinishes` table to `project_finishes`
2. All existing project-finish associations received `percentageUsed = 100`
3. All components updated to use `project.projectFinishes` instead of `project.finishes`

**Files That Required Updates:**

- `ProjectForm.tsx` - Changed from `finishIds` to `projectFinishes` array
- `ProjectDetails.tsx` - Updated to use `projectFinishes`
- `ProjectCard.tsx` - Updated cost calculation
- `ProjectCardMaterials.tsx` - Updated display logic
- `ProjectTable.tsx` - Updated table column
- `SharedProject.tsx` - Added boards section, updated finishes
- `projectLogic.ts` - Added `createProjectFinish()` helper

### Store Logic Helpers

```typescript
// src/store/project/projectLogic.ts

export function createProjectFinish(input: CreateProjectFinishInput): ProjectFinish {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}

// Used in createProject and updateProjectItem:
projectFinishes: input.projectFinishes?.map(createProjectFinish) || [];
```

---

## Cost Calculations

### Total Project Cost Formula

```typescript
totalCost =
  materialCost + // Boards (lumber × board feet)
  finishCost + // Finishes (price × percentage / 100)
  sheetGoodCost + // Sheet goods (price × quantity)
  consumableCost + // Consumables (unitPrice × quantity)
  laborCost + // Manual entry
  miscCost; // Manual entry
```

### Material Cost (Boards)

```typescript
const materialCost = boards.reduce((total, board) => {
  const lumber = board.lumber;
  if (!lumber) return total;

  // Convert varas to inches (1 vara = 33 inches)
  const lengthInInches = board.length * 33;

  // Calculate board feet: (width × thickness × length) / 144
  const boardFeet = (board.width * board.thickness * lengthInInches) / 144;
  const totalBF = boardFeet * board.quantity;

  return total + totalBF * lumber.costPerBoardFoot;
}, 0);
```

### Finish Cost (with Percentage)

```typescript
const finishCost = projectFinishes.reduce((total, projectFinish) => {
  const finish = projectFinish.finish;
  if (!finish) return total;

  const percentageDecimal = projectFinish.percentageUsed / 100;
  return total + finish.price * percentageDecimal;
}, 0);
```

### Sheet Goods Cost

```typescript
const sheetGoodCost = projectSheetGoods.reduce((total, projectSheetGood) => {
  return total + (projectSheetGood.sheetGood?.price || 0) * projectSheetGood.quantity;
}, 0);
```

### Consumable Cost

```typescript
const consumableCost = projectConsumables.reduce((total, projectConsumable) => {
  const consumable = projectConsumable.consumable;
  if (!consumable) return total;

  return total + projectConsumable.quantity * consumable.unitPrice;
}, 0);
```

---

## Component Patterns

### Standard Component Structure

```tsx
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../utils/currency';

export function MyComponent() {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Box>
      <Typography variant="h6">{t('myComponent.title')}</Typography>
      <Typography>{formatCurrency(price)}</Typography>
    </Box>
  );
}
```

### Form Components with Material-UI

```tsx
// Use controlled components
const [value, setValue] = useState('');

<TextField
  label={t('form.label')}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  helperText={t('form.helper')}
  type="number"
/>;
```

### GraphQL Query Pattern

```tsx
import { useQuery } from '@apollo/client';
import { GET_PROJECTS } from '../graphql';

const { data, loading, error } = useQuery(GET_PROJECTS);

if (loading) return <CircularProgress />;
if (error) return <Alert severity="error">{error.message}</Alert>;

const projects = data?.projects || [];
```

### Mutation Pattern

```tsx
import { useMutation } from '@apollo/client';
import { CREATE_PROJECT } from '../graphql';

const [createProject] = useMutation(CREATE_PROJECT, {
  refetchQueries: [{ query: GET_PROJECTS }],
  onCompleted: () => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});

const handleSubmit = async () => {
  await createProject({
    variables: { input: projectData },
  });
};
```

---

## Currency & Language Settings

The app supports **dynamic currency** (CRC/USD) and **multi-language** (English/Spanish) functionality. Settings are controlled from the Settings page and persist across sessions.
