export interface IDeleteRoomOperationPort {
  execute(input: { roomId: string }): Promise<void>;
}
