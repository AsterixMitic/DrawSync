import { HttpStatus } from '@nestjs/common';

export function mapErrorCodeToStatus(errorCode?: string): HttpStatus {
  switch (errorCode) {
    case 'VALIDATION_ERROR':
      return HttpStatus.BAD_REQUEST;
    case 'NOT_FOUND':
      return HttpStatus.NOT_FOUND;
    case 'NOT_AUTHORIZED':
      return HttpStatus.FORBIDDEN;
    case 'INVALID_CREDENTIALS':
      return HttpStatus.UNAUTHORIZED;
    case 'ALREADY_JOINED':
    case 'ALREADY_GUESSED':
    case 'ROOM_FULL':
    case 'EMAIL_TAKEN':
      return HttpStatus.CONFLICT;
    case 'INVALID_STATE':
    case 'DOMAIN_ERROR':
      return HttpStatus.UNPROCESSABLE_ENTITY;
    case 'PERSISTENCE_ERROR':
      return HttpStatus.INTERNAL_SERVER_ERROR;
    default:
      return HttpStatus.BAD_REQUEST;
  }
}
