export interface ITokenProviderPort {
  sign(payload: { userId: string; email: string }): string;
  verify(token: string): { userId: string; email: string } | null;
}
