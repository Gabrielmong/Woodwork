import gql from 'graphql-tag';

export const typeDefs = gql`
  # Scalar for DateTime
  scalar DateTime

  # Enums
  enum ProjectStatus {
    PRICE
    PLANNED
    IN_PROGRESS
    FINISHING
    COMPLETED
  }

  # User Type
  type User {
    id: ID!
    username: String!
    email: String
    firstName: String!
    lastName: String!
    dateOfBirth: DateTime
    hasAcceptedTerms: Boolean!
    imageData: String
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Auth Response Type
  type AuthResponse {
    token: String!
    user: User!
  }

  # Lumber Type
  type Lumber {
    id: ID!
    name: String!
    description: String!
    jankaRating: Float!
    costPerBoardFoot: Float!
    tags: [String!]!
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Finish Type
  type Finish {
    id: ID!
    name: String!
    description: String!
    price: Float!
    tags: [String!]!
    storeLink: String
    imageData: String
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # SheetGood Type
  type SheetGood {
    id: ID!
    name: String!
    description: String!
    width: Float!
    length: Float!
    thickness: Float!
    price: Float!
    materialType: String!
    tags: [String!]!
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Consumable Type
  type Consumable {
    id: ID!
    name: String!
    description: String!
    packageQuantity: Int!
    price: Float!
    unitPrice: Float!
    tags: [String!]!
    storeLink: String
    imageData: String
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Tool Type
  type Tool {
    id: ID!
    name: String!
    description: String!
    function: String!
    price: Float!
    serialNumber: String
    imageData: String
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Board Type
  type Board {
    id: ID!
    width: Float!
    thickness: Float!
    length: Float!
    quantity: Int!
    lumber: Lumber!
    lumberId: String!
    boardFeet: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ProjectSheetGood Type
  type ProjectSheetGood {
    id: ID!
    quantity: Int!
    sheetGood: SheetGood!
    sheetGoodId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ProjectConsumable Type
  type ProjectConsumable {
    id: ID!
    quantity: Int!
    consumable: Consumable!
    consumableId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ProjectFinish Type
  type ProjectFinish {
    id: ID!
    percentageUsed: Float!
    finish: Finish!
    finishId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Project Type
  type Project {
    id: ID!
    name: String!
    description: String!
    status: ProjectStatus!
    price: Float!
    boards: [Board!]!
    projectFinishes: [ProjectFinish!]!
    projectSheetGoods: [ProjectSheetGood!]!
    projectConsumables: [ProjectConsumable!]!
    sheetGoodsCost: Float!
    consumableCost: Float!
    laborCost: Float!
    miscCost: Float!
    additionalNotes: String
    isDeleted: Boolean!
    totalBoardFeet: Float!
    materialCost: Float!
    finishCost: Float!
    totalCost: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Public Shared Project Type (limited information for sharing)
  type SharedProject {
    id: ID!
    name: String!
    description: String!
    status: ProjectStatus!
    price: Float!
    boards: [Board!]!
    projectFinishes: [ProjectFinish!]!
    projectSheetGoods: [ProjectSheetGood!]!
    projectConsumables: [ProjectConsumable!]!
    sheetGoodsCost: Float!
    consumableCost: Float!
    laborCost: Float!
    miscCost: Float!
    additionalNotes: String
    totalBoardFeet: Float!
    materialCost: Float!
    finishCost: Float!
    totalCost: Float!
    createdBy: String!
    currency: String!
    createdAt: DateTime!
  }

  # Settings Type
  type Settings {
    id: ID!
    userId: String!
    currency: String!
    language: String!
    themeMode: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Dashboard Statistics
  type DashboardStats {
    totalProjects: Int!
    totalLumber: Int!
    totalFinishes: Int!
    totalSheetGoods: Int!
    totalConsumables: Int!
    totalTools: Int!
    totalProjectCost: Float!
    totalBoardFeet: Float!
    totalProfit: Float!
    avgCostPerBF: Float!
    totalToolsValue: Float!
  }

  # Input Types for Lumber
  input CreateLumberInput {
    name: String!
    description: String!
    jankaRating: Float!
    costPerBoardFoot: Float!
    tags: [String!]!
  }

  input UpdateLumberInput {
    name: String
    description: String
    jankaRating: Float
    costPerBoardFoot: Float
    tags: [String!]
  }

  # Input Types for Finish
  input CreateFinishInput {
    name: String!
    description: String!
    price: Float!
    tags: [String!]!
    storeLink: String
    imageData: String
  }

  input UpdateFinishInput {
    name: String
    description: String
    price: Float
    tags: [String!]
    storeLink: String
    imageData: String
  }

  # Input Types for SheetGood
  input CreateSheetGoodInput {
    name: String!
    description: String!
    width: Float!
    length: Float!
    thickness: Float!
    price: Float!
    materialType: String!
    tags: [String!]!
  }

  input UpdateSheetGoodInput {
    name: String
    description: String
    width: Float
    length: Float
    thickness: Float
    price: Float
    materialType: String
    tags: [String!]
  }

  # Input Types for Consumable
  input CreateConsumableInput {
    name: String!
    description: String!
    packageQuantity: Int!
    price: Float!
    tags: [String!]!
    storeLink: String
    imageData: String
  }

  input UpdateConsumableInput {
    name: String
    description: String
    packageQuantity: Int
    price: Float
    tags: [String!]
    storeLink: String
    imageData: String
  }

  # Input Types for Tool
  input CreateToolInput {
    name: String!
    description: String!
    function: String!
    price: Float!
    serialNumber: String
    imageData: String
  }

  input UpdateToolInput {
    name: String
    description: String
    function: String
    price: Float
    serialNumber: String
    imageData: String
  }

  # Input Types for Board
  input BoardInput {
    width: Float!
    thickness: Float!
    length: Float!
    quantity: Int!
    lumberId: String!
  }

  # Input Types for ProjectSheetGood
  input ProjectSheetGoodInput {
    quantity: Int!
    sheetGoodId: String!
  }

  # Input Types for ProjectConsumable
  input ProjectConsumableInput {
    quantity: Int!
    consumableId: String!
  }

  # Input Types for ProjectFinish
  input ProjectFinishInput {
    finishId: String!
    percentageUsed: Float!
  }

  # Input Types for Project
  input CreateProjectInput {
    name: String!
    description: String!
    status: ProjectStatus
    price: Float!
    boards: [BoardInput!]
    projectFinishes: [ProjectFinishInput!]
    projectSheetGoods: [ProjectSheetGoodInput!]
    projectConsumables: [ProjectConsumableInput!]
    laborCost: Float!
    miscCost: Float!
    additionalNotes: String
  }

  input UpdateProjectInput {
    name: String
    description: String
    status: ProjectStatus
    price: Float
    boards: [BoardInput!]
    projectFinishes: [ProjectFinishInput!]
    projectSheetGoods: [ProjectSheetGoodInput!]
    projectConsumables: [ProjectConsumableInput!]
    laborCost: Float
    miscCost: Float
    additionalNotes: String
  }

  # Input Types for Settings
  input UpdateSettingsInput {
    currency: String
    language: String
    themeMode: String
  }

  # Input Types for User
  input RegisterInput {
    username: String!
    email: String
    password: String!
    firstName: String!
    lastName: String!
    dateOfBirth: DateTime
    hasAcceptedTerms: Boolean!
    imageData: String
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input UpdateUserInput {
    email: String
    firstName: String
    lastName: String
    dateOfBirth: DateTime
    hasAcceptedTerms: Boolean
    imageData: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  # Queries
  type Query {
    # Auth Queries (Public)
    me: User!

    # Public Queries
    sharedProject(id: ID!): SharedProject

    # User Queries (Private)
    users(includeDeleted: Boolean): [User!]!
    user(id: ID!): User

    # Lumber Queries (Private)
    lumbers(includeDeleted: Boolean): [Lumber!]!
    lumber(id: ID!): Lumber

    # Finish Queries (Private)
    finishes(includeDeleted: Boolean): [Finish!]!
    finish(id: ID!): Finish

    # SheetGood Queries (Private)
    sheetGoods(includeDeleted: Boolean): [SheetGood!]!
    sheetGood(id: ID!): SheetGood

    # Consumable Queries (Private)
    consumables(includeDeleted: Boolean): [Consumable!]!
    consumable(id: ID!): Consumable

    # Tool Queries (Private)
    tools(includeDeleted: Boolean): [Tool!]!
    tool(id: ID!): Tool

    # Project Queries (Private)
    projects(includeDeleted: Boolean): [Project!]!
    project(id: ID!): Project

    # Settings Query (Private)
    settings: Settings!

    # Dashboard Query (Private)
    dashboardStats: DashboardStats!
  }

  # Mutations
  type Mutation {
    # Auth Mutations (Public)
    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!

    # User Mutations (Private)
    updateUser(input: UpdateUserInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
    deleteUser: User!
    restoreUser(id: ID!): User!

    # Lumber Mutations (Private)
    createLumber(input: CreateLumberInput!): Lumber!
    updateLumber(id: ID!, input: UpdateLumberInput!): Lumber!
    deleteLumber(id: ID!): Lumber!
    restoreLumber(id: ID!): Lumber!
    hardDeleteLumber(id: ID!): Boolean!

    # Finish Mutations (Private)
    createFinish(input: CreateFinishInput!): Finish!
    updateFinish(id: ID!, input: UpdateFinishInput!): Finish!
    deleteFinish(id: ID!): Finish!
    restoreFinish(id: ID!): Finish!
    hardDeleteFinish(id: ID!): Boolean!

    # SheetGood Mutations (Private)
    createSheetGood(input: CreateSheetGoodInput!): SheetGood!
    updateSheetGood(id: ID!, input: UpdateSheetGoodInput!): SheetGood!
    deleteSheetGood(id: ID!): SheetGood!
    restoreSheetGood(id: ID!): SheetGood!
    hardDeleteSheetGood(id: ID!): Boolean!

    # Consumable Mutations (Private)
    createConsumable(input: CreateConsumableInput!): Consumable!
    updateConsumable(id: ID!, input: UpdateConsumableInput!): Consumable!
    deleteConsumable(id: ID!): Consumable!
    restoreConsumable(id: ID!): Consumable!
    hardDeleteConsumable(id: ID!): Boolean!

    # Tool Mutations (Private)
    createTool(input: CreateToolInput!): Tool!
    updateTool(id: ID!, input: UpdateToolInput!): Tool!
    deleteTool(id: ID!): Tool!
    restoreTool(id: ID!): Tool!
    hardDeleteTool(id: ID!): Boolean!

    # Project Mutations (Private)
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Project!
    restoreProject(id: ID!): Project!
    hardDeleteProject(id: ID!): Boolean!

    # Settings Mutations (Private)
    updateSettings(input: UpdateSettingsInput!): Settings!
  }
`;
