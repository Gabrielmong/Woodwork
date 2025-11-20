# Development Guide - Grain Lumber Calculator

Quick reference for common development tasks and patterns in this project.

## Quick Start

```bash
# Start backend
cd backend
npm run dev

# Start frontend (separate terminal)
cd frontend
npm run dev
```

## Adding a New Feature

### 1. Database Changes (Backend)

#### Update Prisma Schema
```prisma
// backend/prisma/schema.prisma
model NewFeature {
  id          String   @id @default(uuid())
  name        String
  description String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([isDeleted])
  @@map("new_features")
}
```

#### Run Migration
```bash
cd backend
npx prisma migrate dev --name add_new_feature
npx prisma generate
```

### 2. GraphQL Schema (Backend)

#### Add Type Definitions
```typescript
// backend/src/schema/typeDefs.ts

// Add to type definitions
type NewFeature {
  id: ID!
  name: String!
  description: String!
  isDeleted: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateNewFeatureInput {
  name: String!
  description: String!
}

input UpdateNewFeatureInput {
  name: String
  description: String
}

// Add to Query type
newFeatures(includeDeleted: Boolean): [NewFeature!]!
newFeature(id: ID!): NewFeature

// Add to Mutation type
createNewFeature(input: CreateNewFeatureInput!): NewFeature!
updateNewFeature(id: ID!, input: UpdateNewFeatureInput!): NewFeature!
deleteNewFeature(id: ID!): NewFeature!
restoreNewFeature(id: ID!): NewFeature!
hardDeleteNewFeature(id: ID!): Boolean!
```

### 3. Create Resolvers (Backend)

```typescript
// backend/src/resolvers/newFeatureResolvers.ts
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireOwnership } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export const newFeatureResolvers = {
  Query: {
    newFeatures: async (_: any, { includeDeleted = false }: { includeDeleted?: boolean }, context: any) => {
      const user = requireAuth(context);
      return prisma.newFeature.findMany({
        where: {
          userId: user.userId,
          ...(includeDeleted ? {} : { isDeleted: false }),
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    newFeature: async (_: any, { id }: { id: string }, context: any) => {
      const feature = await prisma.newFeature.findUnique({ where: { id } });
      if (!feature) throw new NotFoundError('Feature not found');
      requireOwnership(context, feature.userId);
      return feature;
    },
  },

  Mutation: {
    createNewFeature: async (_: any, { input }: any, context: any) => {
      const user = requireAuth(context);
      return prisma.newFeature.create({
        data: { ...input, userId: user.userId },
      });
    },

    updateNewFeature: async (_: any, { id, input }: any, context: any) => {
      const feature = await prisma.newFeature.findUnique({ where: { id } });
      if (!feature) throw new NotFoundError('Feature not found');
      requireOwnership(context, feature.userId);
      return prisma.newFeature.update({ where: { id }, data: input });
    },

    deleteNewFeature: async (_: any, { id }: { id: string }, context: any) => {
      const feature = await prisma.newFeature.findUnique({ where: { id } });
      if (!feature) throw new NotFoundError('Feature not found');
      requireOwnership(context, feature.userId);
      return prisma.newFeature.update({ where: { id }, data: { isDeleted: true } });
    },

    restoreNewFeature: async (_: any, { id }: { id: string }, context: any) => {
      const feature = await prisma.newFeature.findUnique({ where: { id } });
      if (!feature) throw new NotFoundError('Feature not found');
      requireOwnership(context, feature.userId);
      return prisma.newFeature.update({ where: { id }, data: { isDeleted: false } });
    },

    hardDeleteNewFeature: async (_: any, { id }: { id: string }, context: any) => {
      const feature = await prisma.newFeature.findUnique({ where: { id } });
      if (!feature) throw new NotFoundError('Feature not found');
      requireOwnership(context, feature.userId);
      await prisma.newFeature.delete({ where: { id } });
      return true;
    },
  },
};
```

#### Register Resolvers
```typescript
// backend/src/resolvers/index.ts
import { newFeatureResolvers } from './newFeatureResolvers';

export const resolvers = {
  Query: {
    ...existingResolvers.Query,
    ...newFeatureResolvers.Query,
  },
  Mutation: {
    ...existingResolvers.Mutation,
    ...newFeatureResolvers.Mutation,
  },
};
```

### 4. TypeScript Types (Frontend)

```typescript
// frontend/src/types/newFeature.ts
export interface NewFeature {
  id: string;
  name: string;
  description: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewFeatureInput {
  name: string;
  description: string;
}

export interface UpdateNewFeatureInput {
  id: string;
  name?: string;
  description?: string;
}
```

### 5. GraphQL Operations (Frontend)

```typescript
// frontend/src/graphql/operations.ts
import { gql } from '@apollo/client';

export const GET_NEW_FEATURES = gql`
  query GetNewFeatures($includeDeleted: Boolean) {
    newFeatures(includeDeleted: $includeDeleted) {
      id
      name
      description
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_NEW_FEATURE = gql`
  mutation CreateNewFeature($input: CreateNewFeatureInput!) {
    createNewFeature(input: $input) {
      id
      name
      description
      createdAt
    }
  }
`;

export const UPDATE_NEW_FEATURE = gql`
  mutation UpdateNewFeature($id: ID!, $input: UpdateNewFeatureInput!) {
    updateNewFeature(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_NEW_FEATURE = gql`
  mutation DeleteNewFeature($id: ID!) {
    deleteNewFeature(id: $id) {
      id
      isDeleted
    }
  }
`;

export const RESTORE_NEW_FEATURE = gql`
  mutation RestoreNewFeature($id: ID!) {
    restoreNewFeature(id: $id) {
      id
      isDeleted
    }
  }
`;
```

### 6. Create Components (Frontend)

#### Form Component
```typescript
// frontend/src/components/NewFeature/NewFeatureForm.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useMutation } from '@apollo/client';
import { CREATE_NEW_FEATURE, UPDATE_NEW_FEATURE, GET_NEW_FEATURES } from '../../graphql/operations';

interface NewFeatureFormProps {
  open: boolean;
  onClose: () => void;
  editingFeature?: NewFeature | null;
}

export function NewFeatureForm({ open, onClose, editingFeature }: NewFeatureFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(editingFeature?.name || '');
  const [description, setDescription] = useState(editingFeature?.description || '');

  const [createFeature] = useMutation(CREATE_NEW_FEATURE, {
    refetchQueries: [{ query: GET_NEW_FEATURES }],
  });

  const [updateFeature] = useMutation(UPDATE_NEW_FEATURE, {
    refetchQueries: [{ query: GET_NEW_FEATURES }],
  });

  const handleSubmit = async () => {
    const input = { name, description };
    if (editingFeature) {
      await updateFeature({ variables: { id: editingFeature.id, input } });
    } else {
      await createFeature({ variables: { input } });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingFeature ? t('newFeature.edit') : t('newFeature.add')}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t('newFeature.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('newFeature.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {editingFeature ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

#### List Component
```typescript
// frontend/src/components/NewFeature/NewFeatureList.tsx
import { Grid, Card, CardContent, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface NewFeatureListProps {
  features: NewFeature[];
  onEdit: (feature: NewFeature) => void;
  onDelete: (id: string) => void;
}

export function NewFeatureList({ features, onEdit, onDelete }: NewFeatureListProps) {
  return (
    <Grid container spacing={3}>
      {features.map((feature) => (
        <Grid item xs={12} md={6} lg={4} key={feature.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{feature.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
              <IconButton onClick={() => onEdit(feature)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(feature.id)}>
                <DeleteIcon />
              </IconButton>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
```

### 7. Add i18n Translations

```json
// frontend/src/i18n/en.json
{
  "newFeature": {
    "title": "New Features",
    "subtitle": "Manage your new features",
    "add": "Add Feature",
    "edit": "Edit Feature",
    "name": "Name",
    "description": "Description",
    "emptyTitle": "No features yet",
    "emptySubtitle": "Get started by adding your first feature"
  }
}
```

### 8. Add Route

```typescript
// frontend/src/router/router.tsx
import { NewFeatureTab } from '../components/NewFeature/NewFeatureTab';

{
  path: '/new-features',
  element: <NewFeatureTab />,
}
```

### 9. Add Navigation

```typescript
// frontend/src/components/Layout/Sidebar.tsx
<ListItemButton onClick={() => navigate('/app/new-features')}>
  <ListItemIcon>
    <NewFeatureIcon />
  </ListItemIcon>
  <ListItemText primary={t('nav.newFeatures')} />
</ListItemButton>
```

## Common Patterns

### Cost Calculation
```typescript
// Always calculate costs, never store them
const totalCost = items.reduce((total, item) => {
  return total + (item.price * item.quantity);
}, 0);
```

### Board Feet Calculation
```typescript
const VARA_TO_INCHES = 33;
const lengthInInches = lengthInVaras * VARA_TO_INCHES;
const boardFeet = (width * thickness * lengthInInches) / 144 * quantity;
```

### Currency Formatting
```typescript
import { useCurrency } from '../../utils/currency';

const formatCurrency = useCurrency();
<Typography>{formatCurrency(amount)}</Typography>
```

### Authentication Check
```typescript
// Backend
const user = requireAuth(context);
requireOwnership(context, resource.userId);

// Frontend (automatic via Apollo Client context)
```

### Soft Delete Pattern
```typescript
// Delete
await prisma.model.update({
  where: { id },
  data: { isDeleted: true }
});

// Restore
await prisma.model.update({
  where: { id },
  data: { isDeleted: false }
});

// Query (exclude deleted by default)
where: {
  userId: user.userId,
  ...(includeDeleted ? {} : { isDeleted: false })
}
```

### Component Structure
```typescript
// Small, focused components (~100 lines)
// Single responsibility
// Props interface with TypeScript
// Use i18n for all text
// Export from index.ts

// Example:
interface ComponentProps {
  data: Type;
  onAction: (id: string) => void;
}

export function Component({ data, onAction }: ComponentProps) {
  const { t } = useTranslation();
  // Component logic
  return (
    <Box>
      <Typography>{t('section.label')}</Typography>
    </Box>
  );
}
```

## Testing Locally

### Test GraphQL API
```bash
# GraphQL Playground available at:
http://localhost:4000/graphql

# Example query:
query {
  lumbers {
    id
    name
    costPerBoardFoot
  }
}
```

### Test Authentication
```javascript
// Login first
mutation {
  login(username: "testuser", password: "password") {
    token
    user { id username }
  }
}

// Add token to headers:
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

## Debugging Tips

### Backend Errors
```typescript
// Check Prisma query logs
// In prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

### Frontend Errors
```typescript
// Apollo Client DevTools (Chrome Extension)
// Check network tab for GraphQL requests
// Use React DevTools for component state
```

### Common Issues

**CORS Errors:**
```typescript
// backend/src/index.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**Database Connection:**
```bash
# Check .env file
DATABASE_URL="postgresql://user:pass@localhost:5432/grain"

# Test connection
npx prisma db pull
```

**GraphQL Schema Sync:**
```bash
# Regenerate after schema changes
cd backend
npx prisma generate
npm run dev
```

## Performance Tips

1. **Use computed fields** for dynamic data (costs, board feet)
2. **Soft delete** for better user experience
3. **Lazy loading** for images (Base64 stored but consider CDN for scale)
4. **Pagination** for large lists (not implemented yet)
5. **Memoization** for expensive calculations
6. **Component splitting** for better code splitting

## Code Style

- **TypeScript:** Strict mode, no `any` types when possible
- **Naming:** camelCase for variables, PascalCase for components
- **Files:** One component per file, export from index.ts
- **i18n:** All user-facing text uses `t()` function
- **Comments:** Minimal, prefer self-documenting code
- **Formatting:** Prettier with 2-space indentation

---

**Happy coding!** 🚀
