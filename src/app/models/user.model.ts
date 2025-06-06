export interface User {
    userID: number;
    username: string;
    email: string;
    password?: string; // Opcional para não retornar nas consultas
    name: string;
    role: string;
    createdAt?: Date;
    isActive?: boolean;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: string;
}