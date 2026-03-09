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
  private resizeObserver!: ResizeObserver;

  @ViewChild('canvas') set canvasSetter(el: ElementRef<HTMLCanvasElement>) {
    if (el) {
      this.canvasEl = el.nativeElement;
      this.ctx = this.canvasEl.getContext('2d')!;
      this.setupResizeObserver();
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
  eraserMode = false;

  get effectiveColor(): string { return this.eraserMode ? '#ffffff' : this.color; }

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

    this.subs.add(this.game.strokeApplied$.subscribe(d => this.drawStroke(d)));
    this.subs.add(this.game.strokeUndone$.subscribe(() => this.redrawAll()));
    this.subs.add(this.game.canvasCleared$.subscribe(() => this.clearCtx()));

    // Wait a tick for socket to connect, then join room
    setTimeout(() => this.game.joinRoom(this.roomId), 300);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.resizeObserver?.disconnect();
    this.game.leaveRoom();
    setTimeout(() => this.game.disconnect(), 150);
  }

  // ── Game actions ──────────────────────────────────────────────

  get isOwner(): boolean { return this.state?.myPlayerId === this.state?.roomOwnerId; }
  get isDrawer(): boolean { return this.state?.myPlayerId === this.state?.drawerId; }
  get isNextDrawer(): boolean { return this.state?.myPlayerId === this.state?.nextDrawerId; }

  get wordUnderscores(): number[] {
    return Array.from({ length: this.state?.wordLength ?? 0 }, (_, i) => i);
  }

  startGame(): void { this.game.startGame(); }
  startRound(): void { this.game.startRound(); }
  completeRound(): void { this.game.completeRound(); }

  leaveRoom(): void {
    this.game.leaveRoom();
    setTimeout(() => {
      this.game.disconnect();
      this.router.navigate(['/home']);
    }, 150);
  }

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

  private readonly STROKE_FLUSH_THRESHOLD = 6;

  onMouseMove(e: MouseEvent): void {
    if (!this.drawing || !this.isDrawer) return;
    const pt = this.getPos(e);
    this.currentPoints.push(pt);
    // Draw preview locally
    if (this.currentPoints.length >= 2) {
      const pts = this.currentPoints;
      this.drawLine(
        this.toPixel(pts[pts.length - 2]),
        this.toPixel(pts[pts.length - 1]),
        this.effectiveColor,
        this.lineWidth,
      );
    }
    // Send partial stroke periodically for real-time feel
    if (this.currentPoints.length >= this.STROKE_FLUSH_THRESHOLD) {
      this.game.applyStroke(this.currentPoints, { color: this.effectiveColor, lineWidth: this.lineWidth, lineCap: 'round' });
      // Keep last point so next chunk connects seamlessly
      this.currentPoints = [this.currentPoints[this.currentPoints.length - 1]];
    }
  }

  onMouseUp(): void {
    if (!this.drawing) return;
    this.drawing = false;
    // Send remaining points
    if (this.currentPoints.length >= 2) {
      this.game.applyStroke(this.currentPoints, { color: this.effectiveColor, lineWidth: this.lineWidth, lineCap: 'round' });
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

  // ── Coordinate helpers ────────────────────────────────────────

  /** Returns normalized 0–1 coords relative to canvas size. */
  private getPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvasEl.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / this.canvasEl.width,
      y: (e.clientY - rect.top) / this.canvasEl.height,
    };
  }

  /** Converts normalized 0–1 coords to pixel coords for the current canvas size. */
  private toPixel(pt: { x: number; y: number }): { x: number; y: number } {
    return { x: pt.x * this.canvasEl.width, y: pt.y * this.canvasEl.height };
  }

  // ── Responsive canvas ─────────────────────────────────────────

  private setupResizeObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.fitCanvas();
      this.redrawAll();
    });
    const container = this.canvasEl.parentElement!;
    this.resizeObserver.observe(container);
    this.fitCanvas();
  }

  private fitCanvas(): void {
    if (!this.canvasEl?.parentElement) return;
    const container = this.canvasEl.parentElement;
    this.canvasEl.width = container.clientWidth;
    this.canvasEl.height = container.clientHeight;
  }

  // ── Drawing ───────────────────────────────────────────────────

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
      this.drawLine(this.toPixel(d.points[i - 1]), this.toPixel(d.points[i]), d.style.color, d.style.lineWidth);
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
    const p = this.state?.players?.find(pl => pl.playerId === playerId);
    return p?.name ?? (p?.userId?.slice(0, 8) + '…') ?? (playerId.slice(0, 8) + '…');
  }
}
