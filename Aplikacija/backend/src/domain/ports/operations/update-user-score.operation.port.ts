export interface IUpdateUserScoreOperationPort {
  execute(input: { userId: string; points: number }): Promise<void>;
}
