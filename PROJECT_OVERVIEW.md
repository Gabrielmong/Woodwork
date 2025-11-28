# Grain - Lumber Calculator Project Overview

## Project Description

**Grain** is a comprehensive woodworking project management application that helps woodworkers track materials, calculate costs, and manage projects. Built for Costa Rican woodworkers, it handles lumber measurements in varas (1 vara = 33 inches) and supports both CRC (₡) and USD ($) currencies.

## Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite (with rolldown-vite)
- **State Management:** Redux Toolkit + redux-persist
- **GraphQL Client:** Apollo Client 3
- **UI Framework:** Material-UI (MUI) v7
- **Styling:** Emotion (CSS-in-JS)
- **Animation:** Framer Motion (for layout animations)
- **i18n:** i18next (English/Spanish/Portuguese support)
- **Routing:** React Router v7

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **GraphQL:** Apollo Server 4
- **Database:** PostgreSQL with Prisma 5 ORM
- **Authentication:** JWT with bcrypt
- **Image Storage:** Base64 encoded in database

## Core Features

### 1. **Material Management**
- **Lumber:** Wood species with Janka hardness ratings, cost per board foot, tags
- **Finishes:** Wood finishes/coatings with pricing, images, store links
- **Sheet Goods:** Plywood, MDF, etc. with dimensions and pricing
- **Consumables:** Screws, glue, sandpaper, etc. with package quantities and unit pricing

### 2. **Project Management**
- Create projects with multiple material types
- Set project quote price (cotización)
- Track project status (Planned, In Progress, Finishing, Completed)
- Project-level measurement units (inches, centimeters, millimeters)
- Calculate costs automatically based on materials used
- Board feet calculations: `(width × thickness × length_in_inches) / 144 × quantity`
- Finish percentage tracking (1-100% usage per finish)
- Labor and miscellaneous costs
- Shareable project links (public view)

### 2.1 **Cut List Management**
- Per-project cut lists with dimensions (width, thickness, length, quantity)
- Checkbox system to mark cuts as complete
- Real-time progress tracking (X/Y completed with percentage)
- Filter views (All, Pending, Completed)
- Automatic sorting (pending first, then by creation date)
- Smooth animations when marking cuts complete (using Framer Motion)
- Measurement unit display adapts to project setting
- Description field for notes (e.g., "table legs", "drawer fronts")

### 3. **Cost Calculations**
- **Material Cost:** Board feet × lumber cost per BF
- **Sheet Goods Cost:** Price × quantity
- **Consumables Cost:** Quantity × unit price (unit price = package price ÷ package quantity)
- **Finish Cost:** Price × (percentage used / 100) for each finish
- **Total Cost:** Materials + Finishes + Sheet Goods + Consumables + Labor + Misc

### 4. **User Features**
- User authentication and authorization
- Personal inventory management
- Dashboard with project statistics
- Settings (currency, language, theme)
- Soft delete with restore functionality

## Database Schema

### Key Models (Prisma)

**User**
- Basic info: username, email, password, firstName, lastName
- Profile: dateOfBirth, imageData (Base64)
- Settings: One-to-one relationship

**Lumber**
- name, description, jankaRating, costPerBoardFoot, tags
- User ownership
- Many-to-many with Projects via Board

**Finish**
- name, description, price, tags, storeLink, imageData
- User ownership
- Many-to-many with Projects via ProjectFinish

**ProjectFinish** (Junction Table)
- percentageUsed (1-100%), projectId, finishId
- Tracks partial usage of finishes in projects
- Cost calculation: finish.price × (percentageUsed / 100)

**SheetGood**
- name, description, width, length, thickness, price, materialType, tags
- User ownership
- Many-to-many with Projects via ProjectSheetGood

**Consumable**
- name, description, packageQuantity, price, tags, storeLink, imageData
- **Unit Price:** Calculated as price ÷ packageQuantity
- User ownership
- Many-to-many with Projects via ProjectConsumable

**Project**
- Basic: name, description, status, price (quote), measurementUnit, laborCost, miscCost, additionalNotes
- Relations: boards[], projectFinishes[], projectSheetGoods[], projectConsumables[], cutLists[]
- Computed fields: totalBoardFeet, materialCost, finishCost, sheetGoodsCost, consumableCost, totalCost
- User ownership

**CutList**
- Dimensions: width, thickness, length, quantity
- description (optional notes)
- isCompleted (boolean for tracking progress)
- References: Project (belongs to project)
- Automatic sorting: pending first, then by creation date
- Cascade delete: deleted when parent project is deleted

**Board**
- width, thickness, length (in varas), quantity
- References: Project, Lumber
- Calculated: boardFeet = (width × thickness × length_in_inches) / 144 × quantity

**ProjectSheetGood** (Junction Table)
- quantity, projectId, sheetGoodId

**ProjectConsumable** (Junction Table)
- quantity (number of items, not packages), projectId, consumableId

**ProjectFinish** (Junction Table)
- percentageUsed (1-100%), projectId, finishId
- Created/Updated timestamps for tracking

## File Structure

### Backend
```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── index.ts              # Express + Apollo Server setup
│   ├── schema/
│   │   └── typeDefs.ts       # GraphQL type definitions
│   ├── resolvers/
│   │   ├── index.ts          # Resolver aggregation
│   │   ├── userResolvers.ts
│   │   ├── lumberResolvers.ts
│   │   ├── finishResolvers.ts
│   │   ├── sheetGoodResolvers.ts
│   │   ├── consumableResolvers.ts
│   │   ├── toolResolvers.ts
│   │   ├── projectResolvers.ts
│   │   ├── cutListResolvers.ts
│   │   ├── settingsResolvers.ts
│   │   └── dashboardResolvers.ts
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   └── utils/
│       └── errors.ts         # Custom error classes
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Project/
│   │   │   ├── Details/      # ProjectDetails sub-components
│   │   │   │   ├── ProjectHeader.tsx
│   │   │   │   ├── ProjectSummary.tsx
│   │   │   │   ├── ProjectBoardsSection.tsx
│   │   │   │   ├── ProjectFinishesSection.tsx
│   │   │   │   ├── ProjectSheetGoodsSection.tsx
│   │   │   │   ├── ProjectConsumablesSection.tsx
│   │   │   │   └── ProjectCostBreakdown.tsx
│   │   │   ├── Form/         # ProjectForm sub-components
│   │   │   │   ├── ProjectBasicInfoSection.tsx
│   │   │   │   ├── ProjectBoardsFormSection.tsx
│   │   │   │   ├── ProjectFinishesFormSection.tsx
│   │   │   │   ├── ProjectSheetGoodsFormSection.tsx
│   │   │   │   ├── ProjectConsumablesFormSection.tsx
│   │   │   │   └── ProjectCostsSection.tsx
│   │   │   ├── List/         # ProjectList sub-components
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectCardHeader.tsx
│   │   │   │   ├── ProjectCardMaterials.tsx
│   │   │   │   ├── ProjectCardCostSummary.tsx
│   │   │   │   └── ProjectCardActions.tsx
│   │   │   ├── ProjectDetails.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectTable.tsx
│   │   │   └── ProjectTab.tsx
│   │   ├── Lumber/
│   │   ├── Finish/
│   │   ├── SheetGood/
│   │   ├── Consumable/
│   │   │   ├── ConsumableTab.tsx
│   │   │   ├── ConsumableForm.tsx
│   │   │   ├── ConsumableList.tsx
│   │   │   ├── ConsumableTable.tsx
│   │   │   └── ConsumableInput.tsx
│   │   ├── Tool/
│   │   └── CutList/
│   │       ├── CutListPage.tsx
│   │       ├── CutListItem.tsx
│   │       └── CutListModal.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Landing.tsx
│   │   ├── SharedProject.tsx
│   │   └── SharedProject/
│   │       └── components/
│   │           ├── SharedProjectHeader.tsx
│   │           ├── SharedProjectInfo.tsx
│   │           └── SharedProjectCostSummary.tsx
│   ├── graphql/
│   │   └── operations.ts     # All GraphQL queries/mutations
│   ├── types/
│   │   ├── lumber.ts
│   │   ├── finish.ts
│   │   ├── sheetGood.ts
│   │   ├── consumable.ts
│   │   ├── project.ts
│   │   └── index.ts
│   ├── i18n/
│   │   └── en.json           # English translations
│   └── router/
│       └── router.tsx        # Route configuration
```

## Key Concepts

### Board Feet Calculation
```typescript
// 1 vara = 33 inches (Costa Rican measurement)
const VARA_TO_INCHES = 33;

// Formula: (width × thickness × length_in_inches) / 144 × quantity
function calculateBoardFeet(width: number, thickness: number, lengthInVaras: number, quantity: number) {
  const lengthInInches = lengthInVaras * VARA_TO_INCHES;
  const boardFeet = (width * thickness * lengthInInches) / 144;
  return boardFeet * quantity;
}
```

### Consumable Unit Price Calculation
```typescript
// Consumables are stored as packages but cost is calculated per item used
const unitPrice = packagePrice / packageQuantity;
const totalCost = quantityUsed * unitPrice;

// Example: Wood Screws
// Package: 100 screws for $12.99
// Unit Price: $12.99 / 100 = $0.13 per screw
// If project needs 250 screws: 250 × $0.13 = $32.50
```

### Project Cost Calculation
```typescript
interface ProjectCosts {
  materialCost: number;      // Sum of all board costs
  finishCost: number;        // Sum of (price × percentageUsed / 100) for each finish
  sheetGoodCost: number;     // Sum of (price × quantity) for sheet goods
  consumableCost: number;    // Sum of (quantity × unitPrice) for consumables
  laborCost: number;         // Manual input
  miscCost: number;          // Manual input
  totalCost: number;         // Sum of all above
}

// Example finish cost with percentage:
const finishCost = projectFinishes.reduce((total, projectFinish) => {
  const percentageDecimal = projectFinish.percentageUsed / 100;
  return total + (projectFinish.finish.price * percentageDecimal);
}, 0);
```

## Recent Major Features

### 1. Cut List Feature (Latest - v1.13.0)
- **Per-Project Cut Lists:** Track individual cuts with dimensions (width, thickness, length, quantity)
- **Progress Tracking:** Checkbox system with real-time progress display (X/Y completed, percentage)
- **Filtering & Sorting:** Filter by All/Pending/Completed, automatic sorting (pending first)
- **Measurement Units:** Project-level setting (inches/cm/mm) that applies to cut list display
- **Smooth Animations:** Framer Motion integration for layout animations when marking cuts complete
- **Delete Confirmation:** MUI Dialog for confirming cut deletions
- **Translations:** Full EN/ES/PT translation support

**Technical Implementation:**
- Backend: New `CutList` model with cascade delete to projects
- GraphQL: Full CRUD operations (queries, mutations, toggle complete)
- Frontend: Three small components (CutListPage, CutListItem, CutListModal)
- Animations: Framer Motion `layout` prop with `AnimatePresence` for smooth reordering
- MUI v7: Updated Grid syntax using `size` prop instead of `item` prop
- Route: `/app/projects/:id/cutlist`

**Files Added/Modified:**
- Backend: `schema.prisma`, `typeDefs.ts`, `cutListResolvers.ts`
- Frontend: `CutList/` components, `types/cutList.ts`, GraphQL operations
- i18n: Added 29 translation keys across EN/ES/PT

### 2. Project Price & Finish Percentage System (v1.12.0)
- **Project Quote Price:** Added `price` field to store quoted/estimated price for projects
- **Finish Percentage Tracking:** Changed from simple many-to-many to explicit `ProjectFinish` join table
  - Track percentage usage (1-100%) for each finish in a project
  - Cost calculation: `finish.price × (percentageUsed / 100)`
  - UI: Slider controls for percentage selection in project form
  - Visual: Percentage badges and adjusted costs in all project views
- **Breaking Change:** Migrated from implicit `_ProjectFinishes` table to explicit `project_finishes`
- **Translation Keys:** Added EN/ES translations for price and percentage fields

**Files Modified:**
- Backend: `schema.prisma`, `typeDefs.ts`, `projectResolvers.ts`, `dashboardResolvers.ts`
- Frontend: All project components updated (`ProjectForm`, `ProjectDetails`, `ProjectCard`, etc.)
- Store: `projectLogic.ts` - Added `createProjectFinish()` helper

### 3. Consumables Feature
- Added full consumables management (like glue, screws, sandpaper)
- Package-based pricing with automatic unit price calculation
- Integration across all project views (Details, List, Table, Form, Shared)
- Cost calculation based on items used, not packages purchased

### 4. Component Refactoring
- Broke down large components (936+ lines) into smaller modules
- Improved maintainability with single-responsibility components
- Created reusable components shared between views
- **Line count reduction:** 67-89% across major components

### 5. Full i18n Support
- Zero hardcoded strings in UI
- 70+ translation keys added
- Ready for multi-language support (English/Spanish)
- Uses react-i18next with `t()` function throughout

## Authentication & Authorization

- **JWT-based authentication** with httpOnly cookies
- **User ownership model:** Each resource belongs to a user
- **Middleware:** `requireAuth()` and `requireOwnership()` functions
- **Soft delete pattern:** `isDeleted` flag with restore capability
- **Public sharing:** Projects can be shared via public links (read-only)

## API Pattern

### GraphQL Queries
```graphql
# Get all lumber for authenticated user
query GetLumbers($includeDeleted: Boolean) {
  lumbers(includeDeleted: $includeDeleted) {
    id name description jankaRating costPerBoardFoot tags
  }
}
```

### GraphQL Mutations
```graphql
# Create a project with materials
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id name totalCost
  }
}
```

### Field Resolvers
- Computed fields like `totalCost`, `boardFeet`, `unitPrice` are calculated on-the-fly
- Prevents data duplication and ensures accuracy

## Development Commands

```bash
# Backend
cd backend
npm install
npx prisma migrate dev      # Run migrations
npx prisma generate         # Generate Prisma client
npm run dev                 # Start dev server

# Frontend
cd frontend
npm install
npm run dev                 # Start Vite dev server
```

## Environment Variables

```env
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/grain"
JWT_SECRET="your-secret-key"
PORT=4000

# Frontend (.env)
VITE_API_URL="http://localhost:4000/graphql"
```

## Key Design Decisions

1. **Costa Rican Focus:** Vara measurements, CRC currency, Spanish support
2. **Soft Deletes:** All resources use `isDeleted` flag instead of hard deletion
3. **Base64 Images:** Product images stored in database for simplicity
4. **Board Feet Standard:** Lumber priced per board foot (industry standard)
5. **Computed Costs:** All costs calculated in real-time, never stored
6. **Package-based Consumables:** Stores package info but costs by item usage
7. **Component Architecture:** Small, focused, reusable components
8. **Type Safety:** Full TypeScript coverage across backend and frontend
9. **GraphQL API:** Single endpoint with strongly-typed schema
10. **i18n First:** All UI text uses translation keys

## Testing Approach

- **No automated tests currently** (manual testing during development)
- **Future:** Unit tests for calculations, integration tests for API
- **Manual testing:** All CRUD operations, cost calculations, sharing, authentication

## Deployment Considerations

- PostgreSQL database required
- Node.js backend (Express + Apollo Server)
- Static frontend build (Vite output)
- Environment variables for configuration
- Consider image CDN instead of Base64 for production scale
- JWT secret management
- CORS configuration for production domains

## Future Enhancements (Potential)

- Mobile app (React Native)
- Print/PDF export of project estimates
- Material suppliers integration
- Project templates
- Collaborative projects
- Analytics/reporting
- Tool rental tracking
- Profit margin calculations
- Material waste calculations
- Shopping list generation

---

**Last Updated:** January 2025
**Project Version:** 1.13.0 (frontend) / 1.13.0 (backend)
**License:** Proprietary
**Target Market:** Costa Rican woodworkers and craftspeople
