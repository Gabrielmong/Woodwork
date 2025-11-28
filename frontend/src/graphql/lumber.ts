import { gql } from '@apollo/client';

// LUMBER OPERATIONS
export const GET_LUMBERS = gql`
  query GetLumbers($includeDeleted: Boolean) {
    lumbers(includeDeleted: $includeDeleted) {
      id
      name
      description
      jankaRating
      costPerBoardFoot
      tags
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const GET_LUMBER = gql`
  query GetLumber($id: ID!) {
    lumber(id: $id) {
      id
      name
      description
      jankaRating
      costPerBoardFoot
      tags
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_LUMBER = gql`
  mutation CreateLumber($input: CreateLumberInput!) {
    createLumber(input: $input) {
      id
      name
      description
      jankaRating
      costPerBoardFoot
      tags
      createdAt
    }
  }
`;

export const UPDATE_LUMBER = gql`
  mutation UpdateLumber($id: ID!, $input: UpdateLumberInput!) {
    updateLumber(id: $id, input: $input) {
      id
      name
      description
      jankaRating
      costPerBoardFoot
      tags
      updatedAt
    }
  }
`;

export const DELETE_LUMBER = gql`
  mutation DeleteLumber($id: ID!) {
    deleteLumber(id: $id) {
      id
      isDeleted
    }
  }
`;

export const RESTORE_LUMBER = gql`
  mutation RestoreLumber($id: ID!) {
    restoreLumber(id: $id) {
      id
      isDeleted
    }
  }
`;
