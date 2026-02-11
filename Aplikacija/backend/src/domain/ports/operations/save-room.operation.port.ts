import { Room } from 'src/domain/models';

export interface ISaveRoomOperationPort {
  execute(input: { room: Room }): Promise<void>;
}
