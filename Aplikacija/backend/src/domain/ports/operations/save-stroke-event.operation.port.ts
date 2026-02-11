import { StrokeEvent } from 'src/domain/models';

export interface ISaveStrokeEventOperationPort {
  execute(input: { strokeEvent: StrokeEvent }): Promise<void>;
}
