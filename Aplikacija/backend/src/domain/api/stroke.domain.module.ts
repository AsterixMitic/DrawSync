import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { ApplyStrokeCommand } from '../commands/stroke/apply-stroke.command';
import { ClearCanvasCommand } from '../commands/stroke/clear-canvas.command';
import { UndoStrokeCommand } from '../commands/stroke/undo-stroke.command';
import { StrokeDomainApi } from './stroke.domain-api';

@Module({
  imports: [PersistenceModule],
  providers: [
    ApplyStrokeCommand,
    ClearCanvasCommand,
    UndoStrokeCommand,
    StrokeDomainApi
  ],
  exports: [StrokeDomainApi]
})
export class StrokeDomainModule {}
