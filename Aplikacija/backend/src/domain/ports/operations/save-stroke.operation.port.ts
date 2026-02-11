import { Stroke } from 'src/domain/models';

export interface ISaveStrokeOperationPort {
  execute(input: { stroke: Stroke }): Promise<void>;
}
