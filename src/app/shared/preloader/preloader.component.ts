import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloaderService } from '../../core/services/preloader.service';

interface BootLog {
  message: string;
  status: 'pending' | 'running' | 'success';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalColor: string;
}

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Visibility flags
  isVisible = true;
  isFadingOut = false;

  // Progress bar
  progress = 0;
  private progressIntervalId: any;
  private currentTargetProgress = 0;

  // Quotes
  currentQuoteIndex = 0;
  private quoteIntervalId: any;
  readonly quotes = [
    { text: "Angular 19 introduces full Signal-based reactive forms and local template signals, removing the need for heavy RxJS boilerplate in components.", author: "Angular Signals" },
    { text: "Server-Side Rendering (SSR) with Event Replay is now stable in Angular. It allows the page to load instantly and replay user clicks after hydration finishes.", author: "SSR & Hydration" },
    { text: "Rust is taking over JavaScript build tools. Projects like Rolldown, Biome, and Rsbuild are replacing Babel and Webpack with 10x-100x performance increases.", author: "Rust JS Tooling" },
    { text: "The developer ecosystem is shifting from simple autocomplete to autonomous AI Coding Agents that can plan, execute, and verify codebase changes.", author: "AI Coding Agents" },
    { text: "WebGPU is replacing WebGL to bring modern high-performance graphics and machine learning computation directly to the browser.", author: "WebGPU Graphics" },
    { text: "Retrieval-Augmented Generation (RAG) is a key pattern in modern AI, allowing Large Language Models to search local databases before generating replies.", author: "Enterprise AI (RAG)" },
    { text: "Deploying APIs to Edge runtimes (Cloudflare Workers, Vercel Edge) brings execution close to the user, reducing cold starts to under 10ms.", author: "Edge Computing" },
    { text: "React Server Components and Server Actions allow frontend developers to write server-side database queries directly inside component files.", author: "React Server Components" },
    { text: "Bun is a fast all-in-one JavaScript runtime that replaces Node.js, npm, Jest, and Webpack with instant startup and native TypeScript support.", author: "JavaScript Runtimes" }
  ];

  // Boot Logs
  bootLogs: BootLog[] = [
    { message: 'Waking up Render backend web service...', status: 'running' },
    { message: 'Sending GET request to trigger spin-up...', status: 'pending' },
    { message: 'Initializing handshake protocols...', status: 'pending' },
    { message: 'Mounting API router database modules...', status: 'pending' },
    { message: 'Running health check procedures...', status: 'pending' },
    { message: 'Warming up cache and server instances...', status: 'pending' },
    { message: 'Compiling assets and style modules...', status: 'pending' },
    { message: 'Server responding. Completing boot sequence...', status: 'pending' }
  ];
  private logTimerIds: any[] = [];

  // Canvas Particles
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId!: number;
  private mouse = { x: -1000, y: -1000, active: false };

  constructor(
    private preloaderService: PreloaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Cycle quotes
    this.currentQuoteIndex = Math.floor(Math.random() * this.quotes.length);
    this.quoteIntervalId = setInterval(() => {
      this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
      this.cdr.markForCheck();
    }, 8000);

    // 2. Play boot log sequence
    this.playBootLogs();

    // 3. Simulated progress bar crawling
    this.startProgressSimulation();

    // 4. Subscribe to PreloaderService loading state
    this.preloaderService.isLoading$.subscribe((loading) => {
      if (!loading) {
        this.completeLoading();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  ngOnDestroy(): void {
    if (this.quoteIntervalId) clearInterval(this.quoteIntervalId);
    if (this.progressIntervalId) clearInterval(this.progressIntervalId);
    this.logTimerIds.forEach(id => clearTimeout(id));
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  private playBootLogs(): void {
    // Transition logs step-by-step
    const delays = [3000, 7000, 12000, 18000, 24000, 30000, 36000];
    
    // First log is already running. Let's make it success after 3s.
    this.logTimerIds.push(setTimeout(() => {
      this.bootLogs[0].status = 'success';
      this.bootLogs[1].status = 'running';
      this.cdr.markForCheck();
    }, 2000));

    // Subsequent logs
    for (let i = 1; i < this.bootLogs.length - 1; i++) {
      this.logTimerIds.push(setTimeout(() => {
        this.bootLogs[i].status = 'success';
        this.bootLogs[i + 1].status = 'running';
        this.cdr.markForCheck();
      }, delays[i - 1]));
    }
  }

  private startProgressSimulation(): void {
    let elapsedSeconds = 0;
    
    this.progressIntervalId = setInterval(() => {
      elapsedSeconds += 0.2;

      // Logic for crawling progress
      if (elapsedSeconds < 5) {
        // Fast start: 0% to 35% in 5 seconds
        this.currentTargetProgress = (elapsedSeconds / 5) * 35;
      } else if (elapsedSeconds < 20) {
        // Slow down: 35% to 70% in next 15 seconds
        this.currentTargetProgress = 35 + ((elapsedSeconds - 5) / 15) * 35;
      } else if (elapsedSeconds < 50) {
        // Crawl: 70% to 95% in next 30 seconds
        this.currentTargetProgress = 70 + ((elapsedSeconds - 20) / 30) * 25;
      } else {
        // Flatline at 98% until server wakes up
        this.currentTargetProgress = Math.min(98, this.currentTargetProgress + 0.05);
      }

      // Smooth interpolation
      if (this.progress < this.currentTargetProgress) {
        this.progress += (this.currentTargetProgress - this.progress) * 0.1;
      }

      // Make sure we round and cap
      this.progress = Math.min(98, parseFloat(this.progress.toFixed(1)));
      this.cdr.markForCheck();
    }, 200);
  }

  private completeLoading(): void {
    // Stop simulated progress and jump to 100%
    if (this.progressIntervalId) clearInterval(this.progressIntervalId);
    
    // Complete all boot logs
    this.bootLogs.forEach(log => log.status = 'success');
    
    // Add success welcome log
    const welcomeLog: BootLog = { message: 'All systems green! Welcome!', status: 'success' };
    this.bootLogs.push(welcomeLog);

    // Fast animation to 100%
    const remaining = 100 - this.progress;
    const steps = 10;
    const stepSize = remaining / steps;
    let currentStep = 0;

    const fastFillInterval = setInterval(() => {
      this.progress += stepSize;
      currentStep++;
      
      if (currentStep >= steps) {
        this.progress = 100;
        clearInterval(fastFillInterval);
        
        // Wait a small moment, then fade out
        setTimeout(() => {
          this.isFadingOut = true;
          this.cdr.markForCheck();
          
          // Complete removal from DOM after fade-out transition (800ms)
          setTimeout(() => {
            this.isVisible = false;
            this.cdr.markForCheck();
          }, 8000); // 800ms transition time + buffer
        }, 600);
      }
      this.cdr.markForCheck();
    }, 50);
  }

  skipPreloader(): void {
    this.preloaderService.dismiss();
  }

  // ── Interactive 2D Canvas Particles ───────────────────────

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.spawnParticles(80);
    this.animateParticles();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
  }

  private spawnParticles(count: number): void {
    const canvas = this.canvasRef.nativeElement;
    const colors = ['#7c3aed', '#06b6d4', '#a855f7', '#0ea5e9', '#38bdf8'];
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 2 + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius,
        color,
        originalColor: color
      });
    }
  }

  private animateParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    this.particles.forEach((p) => {
      // Physics move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce on boundaries
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Mouse interactive push force
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 3;
          p.y += Math.sin(angle) * force * 3;
          p.color = '#ffffff'; // light up near mouse
        } else {
          p.color = p.originalColor;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
    });

    // Draw connection lines
    this.ctx.shadowBlur = 0; // reset shadow for lines performance
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const alpha = (100 - dist) / 100 * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
          this.ctx.stroke();
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  onMouseMove(event: MouseEvent): void {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.mouse.active = true;
  }

  onMouseLeave(): void {
    this.mouse.active = false;
  }

  onCanvasClick(event: MouseEvent): void {
    // Spawn burst of particles on click!
    const canvas = this.canvasRef.nativeElement;
    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#3b82f6', '#10b981', '#f59e0b'];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * 2 + 1.5;
      const speed = Math.random() * 1.5 + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x: event.clientX,
        y: event.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        color,
        originalColor: color
      });
    }

    // Limit maximum particles to avoid lag
    if (this.particles.length > 200) {
      this.particles.splice(0, this.particles.length - 200);
    }
  }
}
