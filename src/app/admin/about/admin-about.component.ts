import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import * as THREE from 'three';
import { AdminAboutService } from '../../core/services/admin-about.service';
import { AboutDTO } from '../../core/models/about-dto.model';

type ViewMode = 'view' | 'create' | 'edit';
type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-admin-about',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-about.component.html',
  styleUrls: ['./admin-about.component.scss'],
})
export class AdminAboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // ── State ──────────────────────────────────────────────────
  mode: ViewMode = 'view';
  fetchStatus: ApiStatus = 'loading';
  saveStatus: ApiStatus = 'idle';
  deleteStatus: ApiStatus = 'idle';

  currentData: AboutDTO | null = null;
  errorMsg = '';
  successMsg = '';

  form!: FormGroup;

  // ── Three.js ───────────────────────────────────────────────
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationId!: number;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);

  constructor(
    private fb: FormBuilder,
    private adminAboutService: AdminAboutService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadAbout();
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  // ── Form ───────────────────────────────────────────────────

  private buildForm(data?: AboutDTO): void {
    this.form = this.fb.group({
      name:       [data?.name       ?? '', [Validators.required]],
      profession: [data?.profession ?? '', [Validators.required]],
      email:      [data?.email      ?? '', [Validators.required, Validators.email]],
      experience: [data?.experience ?? null, [Validators.required, Validators.min(0)]],
      degree:     [data?.degree     ?? '', [Validators.required]],
      role:       [data?.role       ?? '', [Validators.required]],
      location:   [data?.location   ?? '', [Validators.required]],
      about: this.fb.array(
        (data?.about ?? ['']).map((p) => this.fb.control(p, Validators.required)),
      ),
    });
  }

  get aboutArray(): FormArray {
    return this.form.get('about') as FormArray;
  }

  addAboutPoint(): void {
    this.aboutArray.push(this.fb.control('', Validators.required));
  }

  removeAboutPoint(i: number): void {
    if (this.aboutArray.length > 1) this.aboutArray.removeAt(i);
  }

  // ── Data loading ───────────────────────────────────────────

  loadAbout(): void {
    this.fetchStatus = 'loading';
    this.adminAboutService.getAbout().subscribe({
      next: (res) => {
        this.currentData = res.data;
        this.fetchStatus = 'success';
      },
      error: () => {
        this.fetchStatus = 'error';
        this.currentData = null;
      },
    });
  }

  // ── Mode switching ─────────────────────────────────────────

  enterCreate(): void {
    this.buildForm();
    this.mode = 'create';
    this.clearMessages();
  }

  enterEdit(): void {
    this.buildForm(this.currentData ?? undefined);
    this.mode = 'edit';
    this.clearMessages();
  }

  cancelEdit(): void {
    this.mode = 'view';
    this.clearMessages();
  }

  // ── CRUD ───────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: AboutDTO = this.form.value;
    this.saveStatus = 'loading';
    this.clearMessages();

    if (this.mode === 'create') {
      this.adminAboutService.createAbout(payload).subscribe({
        next: (res) => {
          this.saveStatus = 'success';
          this.successMsg = res.msg ?? 'About record created successfully.';
          this.mode = 'view';
          this.loadAbout();
        },
        error: (err) => {
          this.saveStatus = 'error';
          this.errorMsg = this.extractError(err, 'Failed to create about record.');
        },
      });
    } else {
      const id = this.currentData?.id!;
      this.adminAboutService.updateAbout(id, payload).subscribe({
        next: (res) => {
          this.saveStatus = 'success';
          this.successMsg = res.msg ?? 'About record updated successfully.';
          this.currentData = res.data;
          this.mode = 'view';
          this.loadAbout();
        },
        error: (err) => {
          this.saveStatus = 'error';
          this.errorMsg = this.extractError(err, 'Failed to update about record.');
        },
      });
    }
  }

  confirmDelete(): void {
    if (!this.currentData?.id) return;
    if (!confirm('Are you sure you want to delete the about record? This cannot be undone.')) return;

    this.deleteStatus = 'loading';
    this.clearMessages();

    this.adminAboutService.deleteAbout(this.currentData.id).subscribe({
      next: (res) => {
        this.deleteStatus = 'idle';
        this.successMsg = res.msg ?? 'About record deleted.';
        this.currentData = null;
        this.fetchStatus = 'error'; // no data any more
      },
      error: (err) => {
        this.deleteStatus = 'error';
        this.errorMsg = this.extractError(err, 'Failed to delete about record.');
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────

  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || !c.invalid || !c.touched) return '';
    if (c.errors?.['required']) return `${name} is required.`;
    if (c.errors?.['email'])    return 'Enter a valid email.';
    if (c.errors?.['min'])      return 'Must be 0 or more.';
    return 'Invalid value.';
  }

  private extractError(err: unknown, fallback: string): string {
    const e = err as { error?: { responseDTO?: { msg?: string }; msg?: string } };
    return e?.error?.responseDTO?.msg ?? e?.error?.msg ?? fallback;
  }

  private clearMessages(): void {
    this.errorMsg   = '';
    this.successMsg = '';
    this.saveStatus  = 'idle';
    this.deleteStatus = 'idle';
  }

  // ── Three.js ───────────────────────────────────────────────

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    this.camera.position.z = 90;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Grid of small cubes
    const palette = [0x7c3aed, 0x06b6d4, 0xa855f7, 0x0ea5e9];
    for (let i = 0; i < 30; i++) {
      const s = 1.2 + Math.random() * 1.2;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(s, s, s),
        new THREE.MeshStandardMaterial({
          color: palette[i % palette.length],
          emissive: palette[i % palette.length],
          emissiveIntensity: 0.4,
          transparent: true, opacity: 0.35,
          wireframe: Math.random() > 0.5,
        }),
      );
      const r = 40 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.group.add(mesh);
    }

    // Starfield
    const pPos = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 300;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 300;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    this.scene.add(new THREE.Points(pGeo,
      new THREE.PointsMaterial({ size: 0.3, color: 0x475569, transparent: true, opacity: 0.45 })));

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0x7c3aed, 2, 300);
    pl.position.set(0, 0, 60); this.scene.add(pl);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.group.rotation.y = t * 0.05 + this.mouse.x * 0.06;
    this.group.rotation.x = Math.sin(t * 0.04) * 0.12 + this.mouse.y * 0.04;
    this.group.children.forEach((c, i) => {
      c.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1);
      c.rotation.y += 0.004 * (i % 3 === 0 ? 1 : -1);
    });
    this.renderer.render(this.scene, this.camera);
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
