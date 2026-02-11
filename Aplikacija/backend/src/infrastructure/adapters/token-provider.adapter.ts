import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ITokenProviderPort } from '../../domain/ports';

@Injectable()
export class TokenProviderAdapter implements ITokenProviderPort {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: { userId: string; email: string }): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): { userId: string; email: string } | null {
    try {
      return this.jwtService.verify(token) as { userId: string; email: string };
    } catch {
      return null;
    }
  }
}
