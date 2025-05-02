export interface Collaborator {
    collaboratorID: number;
    name: string;
    fkcc: number;
    costCenter?: {
      description: string;
    };
  }