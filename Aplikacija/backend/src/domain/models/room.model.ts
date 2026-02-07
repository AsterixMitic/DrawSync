import { RoomStatus, PlayerState } from '../enums';
import { RoomFullError, InvalidStateError } from '../errors';
import { generateUUID } from '../../shared/utils/uuid.util';
import { Player } from './player.model';
import { Round } from './round.model';

export interface RoomProps {
  id?: string;
  status?: RoomStatus;
  createdAt?: Date;
  roundCount?: number;
  playerMaxCount?: number;
  roomOwnerId?: string;
  currentRoundId?: string | null;
  players?: Player[];
  rounds?: Round[];
}

export class Room {
  private readonly _id: string;
  private _status: RoomStatus;
  private readonly _createdAt: Date;
  private readonly _roundCount: number;
  private readonly _playerMaxCount: number;
  private _roomOwnerId: string;
  private _currentRoundId: string | null;
  private _players: Player[];
  private _rounds: Round[];

  constructor(props: RoomProps) {
    this._id = props.id ?? generateUUID();
    this._status = props.status ?? RoomStatus.WAITING;
    this._createdAt = props.createdAt ?? new Date();
    this._roundCount = props.roundCount ?? 3;
    this._playerMaxCount = props.playerMaxCount ?? 8;
    this._roomOwnerId = props.roomOwnerId ?? '';
    this._currentRoundId = props.currentRoundId ?? null;
    this._players = props.players ?? [];
    this._rounds = props.rounds ?? [];
  }

  // Getters
  get id(): string { return this._id; }
  get status(): RoomStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get roundCount(): number { return this._roundCount; }
  get playerMaxCount(): number { return this._playerMaxCount; }
  get roomOwnerId(): string { return this._roomOwnerId; }
  get currentRoundId(): string | null { return this._currentRoundId; }
  get players(): readonly Player[] { return [...this._players]; }
  get rounds(): readonly Round[] { return [...this._rounds]; }

  // Computed properties
  get playerCount(): number {
    return this._players.length;
  }

  get isFull(): boolean {
    return this._players.length >= this._playerMaxCount;
  }

  get isWaiting(): boolean {
    return this._status === RoomStatus.WAITING;
  }

  get isInProgress(): boolean {
    return this._status === RoomStatus.IN_PROGRESS;
  }

  get isFinished(): boolean {
    return this._status === RoomStatus.FINISHED;
  }

  get currentRound(): Round | null {
    if (!this._currentRoundId) return null;
    return this._rounds.find(r => r.id === this._currentRoundId) ?? null;
  }

  get currentDrawer(): Player | null {
    return this._players.find(p => p.state === PlayerState.DRAWING) ?? null;
  }

  // Business methods
  canAddPlayer(): boolean {
    return !this.isFull && this._status === RoomStatus.WAITING;
  }

  addPlayer(player: Player): void {
    if (this.isFull) {
      throw new RoomFullError(this._id, this._playerMaxCount);
    }
    if (this._status !== RoomStatus.WAITING) {
      throw new InvalidStateError('Room', this._status, RoomStatus.WAITING);
    }
    if (this._players.some(p => p.userId === player.userId)) {
      throw new Error('User already in room');
    }

    this._players.push(player);

    // First player becomes room owner
    if (this._players.length === 1) {
      this._roomOwnerId = player.playerId;
    }
  }

  removePlayer(playerId: string): Player | null {
    const index = this._players.findIndex(p => p.playerId === playerId);
    if (index === -1) return null;

    const [removed] = this._players.splice(index, 1);

    // Transfer ownership if owner left
    if (this._roomOwnerId === playerId && this._players.length > 0) {
      this._roomOwnerId = this._players[0].playerId;
    }

    // Handle drawer leaving during game
    if (removed.isDrawer() && this._status === RoomStatus.IN_PROGRESS) {
      this.transferDrawerRole();
    }

    return removed;
  }

  getPlayer(playerId: string): Player | null {
    return this._players.find(p => p.playerId === playerId) ?? null;
  }

  getPlayerByUserId(userId: string): Player | null {
    return this._players.find(p => p.userId === userId) ?? null;
  }

  startGame(): Round {
    if (this._status !== RoomStatus.WAITING) {
      throw new InvalidStateError('Room', this._status, RoomStatus.WAITING);
    }
    if (this._players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    this._status = RoomStatus.IN_PROGRESS;
    return this.createNextRound();
  }

  createNextRound(): Round {
    const roundNo = this._rounds.length + 1;
    if (roundNo > this._roundCount) {
      throw new Error('Maximum rounds reached');
    }

    // Select next drawer (round-robin)
    const drawerIndex = (roundNo - 1) % this._players.length;
    const drawer = this._players[drawerIndex];

    // Update player states
    this._players.forEach(p => {
      if (p.playerId === drawer.playerId) {
        p.setAsDrawer();
      } else {
        p.setAsGuesser();
      }
    });

    const round = new Round({
      roundNo,
      roomId: this._id,
      currentDrawerId: drawer.playerId
    });

    this._rounds.push(round);
    this._currentRoundId = round.id;

    return round;
  }

  completeCurrentRound(): void {
    const currentRound = this.currentRound;
    if (!currentRound) {
      throw new Error('No current round');
    }

    currentRound.complete();

    // Check if game is finished
    if (this._rounds.length >= this._roundCount) {
      this._status = RoomStatus.FINISHED;
      this._players.forEach(p => p.setAsWaiting());
    }
  }

  private transferDrawerRole(): void {
    const guessers = this._players.filter(p => p.state === PlayerState.GUESSING);
    if (guessers.length > 0) {
      guessers[0].setAsDrawer();
    }
  }

  setPlayers(players: Player[]): void {
    this._players = players;
  }

  setRounds(rounds: Round[]): void {
    this._rounds = rounds;
  }

  beginGame(): void {
    if (this._status !== RoomStatus.WAITING) {
      throw new InvalidStateError('Room', this._status, RoomStatus.WAITING);
    }
    if (this._players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }
    this._status = RoomStatus.IN_PROGRESS;
  }

  setCurrentRoundId(roundId: string | null): void {
    this._currentRoundId = roundId;
  }
}
