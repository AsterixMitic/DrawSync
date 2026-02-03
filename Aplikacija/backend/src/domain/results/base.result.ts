export interface IResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export class Result<T> implements IResult<T> {
  public readonly success: boolean;
  public readonly data?: T;
  public readonly error?: string;
  public readonly errorCode?: string;

  private constructor(success: boolean, data?: T, error?: string, errorCode?: string) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.errorCode = errorCode;
    Object.freeze(this);
  }

  static ok<T>(data: T): Result<T> {
    return new Result<T>(true, data);
  }

  static fail<T>(error: string, errorCode?: string): Result<T> {
    return new Result<T>(false, undefined, error, errorCode);
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }
}