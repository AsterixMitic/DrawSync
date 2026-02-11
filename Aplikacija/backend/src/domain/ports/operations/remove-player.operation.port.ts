export interface IRemovePlayerOperationPort {
  execute(input: { playerId: string }): Promise<void>;
}
