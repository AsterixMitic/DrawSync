import { Room } from '../../models/room.model';
import { Player } from '../../models/player.model';

export interface ICreateRoomOperationPort {
  execute(input: { room: Room; player: Player }): Promise<void>;
}
