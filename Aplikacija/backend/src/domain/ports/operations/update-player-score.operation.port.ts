export interface IUpdatePlayerScoreOperationPort {
  execute(input: { playerId: string; points: number }): Promise<void>;
}
