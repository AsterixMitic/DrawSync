import { User } from "src/domain/models";

export interface IUserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
