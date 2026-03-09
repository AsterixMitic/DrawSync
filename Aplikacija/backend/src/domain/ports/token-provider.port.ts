export interface ITokenProviderPort {
  sign(payload: { userId: string; email: string; name?: string }): string;
  verify(token: string): { userId: string; email: string; name?: string } | null;
}
