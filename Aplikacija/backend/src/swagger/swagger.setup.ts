import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { openApiSpec } from './openapi.spec';

/**
 * Mounts the Swagger UI at /api/docs using a standalone OpenAPI spec.
 * No decorators are added to controllers or DTOs — everything is defined
 * in openapi.spec.ts.
 */
export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup('api/docs', app, openApiSpec as any, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'DrawSync API Docs',
  });
}
