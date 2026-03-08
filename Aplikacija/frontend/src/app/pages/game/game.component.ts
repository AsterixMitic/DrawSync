import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GameService, GameState, StrokeData } from '../../services/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements OnInit, OnDestroy {
  private canvasEl!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  @ViewChild('canvas') set canvasSetter(el: ElementRef<HTMLCanvasElement>) {
    if (el) {
      this.canvasEl = el.nativeElement;
      this.ctx = this.canvasEl.getContext('2d')!;
    }
  }

  state!: GameState;
  guessText = '';
  error = '';
  roomId = '';

  private drawing = false;
  private currentPoints: { x: number; y: number }[] = [];
  private subs = new Subscription();

  // Drawing tool settings
  color = '#000000';
  lineWidth = 4;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    public game: GameService,
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId')!;
    const token = this.auth.token!;

    this.game.connect(token);

    this.subs.add(this.game.state$.subscribe(s => {
      this.state = s;
    }));

    this.subs.add(this.game.error$.subscribe(e => {
      this.error = e;
      setTimeout(() => this.error = '', 4000);
    }));

    this.subs.add(this.game.strokeApplied$.subscribe(d => {
      if (!this.isDrawer) this.drawStroke(d);
    }));
    this.subs.add(this.game.strokeUndone$.subscribe(() => this.redrawAll()));
    this.subs.add(this.game.canvasCleared$.subscribe(() => this.clearCtx()));

    // Wait a tick for socket to connect, then join room
    setTimeout(() => this.game.joinRoom(this.roomId), 300);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.game.leaveRoom();
  }

  // ── Game actions ──────────────────────────────────────────────

  get isOwner(): boolean { return this.state?.myPlayerId === this.state?.roomOwnerId; }
  get isDrawer(): boolean { return this.state?.myPlayerId === this.state?.drawerId; }
  get isNextDrawer(): boolean { return this.state?.myPlayerId === this.state?.nextDrawerId; }

  get currentDrawer() { return this.state?.players.find(p => p.playerId === this.state?.drawerId); }
  get timerWarning(): boolean { const t = this.state?.timeLeft; return t !== null && t !== undefined && t <= 10; }
  get sortedPlayers() { return [...(this.state?.players ?? [])].sort((a, b) => b.score - a.score); }

  get wordDisplay(): string {
    if (this.state?.word) return this.state.word;
    if (this.state?.hintDisplay) return this.state.hintDisplay;
    if (this.state?.wordLength) return Array(this.state.wordLength).fill('_').join(' ');
    return '';
  }

  startGame(): void { this.game.startGame(); }
  startRound(): void { this.game.startRound(); }
  selectWord(word: string): void { this.game.selectWord(word); }
  completeRound(): void { this.game.completeRound(); }

  leaveRoom(): void {
    this.game.leaveRoom();
    this.router.navigate(['/home']);
  }

  resetRoom(): void { this.game.resetRoom(); }

  submitGuess(): void {
    if (!this.guessText.trim()) return;
    this.game.submitGuess(this.guessText.trim());
    this.guessText = '';
  }

  // ── Canvas ────────────────────────────────────────────────────

  onMouseDown(e: MouseEvent): void {
    if (!this.isDrawer) return;
    this.drawing = true;
    this.currentPoints = [this.getPos(e)];
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.drawing || !this.isDrawer) return;
    const pt = this.getPos(e);
    this.currentPoints.push(pt);
    // Draw preview locally
    if (this.currentPoints.length >= 2) {
      const pts = this.currentPoints;
      this.drawLine(pts[pts.length - 2], pts[pts.length - 1], this.color, this.lineWidth);
    }
  }

  onMouseUp(): void {
    if (!this.drawing) return;
    this.drawing = false;
    if (this.currentPoints.length >= 2) {
      this.game.applyStroke(this.currentPoints, { color: this.color, lineWidth: this.lineWidth, lineCap: 'round' });
    }
    this.currentPoints = [];
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && this.isDrawer) {
      e.preventDefault();
      this.game.undoStroke();
    }
  }

  onClearCanvas(): void { this.game.clearCanvas(); }

  private getPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvasEl.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private drawLine(a: { x: number; y: number }, b: { x: number; y: number }, color: string, width: number): void {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.stroke();
  }

  private drawStroke(d: StrokeData): void {
    if (d.points.length < 2) return;
    for (let i = 1; i < d.points.length; i++) {
      this.drawLine(d.points[i - 1], d.points[i], d.style.color, d.style.lineWidth);
    }
  }

  private redrawAll(): void {
    this.clearCtx();
    for (const stroke of this.state.strokes) {
      this.drawStroke(stroke);
    }
  }

  private clearCtx(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  }

  playerName(playerId: string): string {
    const p = this.state?.players.find(pl => pl.playerId === playerId);
    return p?.name ?? p?.userId?.slice(0, 8) ?? playerId.slice(0, 8);
  }
}
