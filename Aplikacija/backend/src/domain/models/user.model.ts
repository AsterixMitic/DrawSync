import { generateUUID } from '../../shared/utils/uuid.util';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  imgPath?: string | null;
  totalScore?: number;
  createdAt?: Date;
}

export class User {
  private readonly _id: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _imgPath: string | null;
  private _totalScore: number;
  private readonly _createdAt: Date;

  constructor(props: UserProps) {
    this._id = props.id ?? generateUUID();
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._imgPath = props.imgPath ?? null;
    this._totalScore = props.totalScore ?? 0;
    this._createdAt = props.createdAt ?? new Date();
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get imgPath(): string | null { return this._imgPath; }
  get totalScore(): number { return this._totalScore; }
  get createdAt(): Date { return this._createdAt; }

  // Business methods
  updateProfile(name: string, imgPath?: string): void {
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    this._name = name.trim();
    if (imgPath !== undefined) {
      this._imgPath = imgPath;
    }
  }

  addToTotalScore(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }
    this._totalScore += points;
  }

  changePassword(newPassword: string): void {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    this._password = newPassword;
  }
}