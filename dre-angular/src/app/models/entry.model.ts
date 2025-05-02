export interface Entry {
    entryID: number;
    entryDate: Date | string;
    entryType: string;
    value: number;
    fkc: number;
    fkBank?: number;
    collaborator?: {
      name: string;
      costCenter?: {
        description: string;
      }
    };
    bank?: {
      name: string;
      code: string;
    };
  }