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
import { AdminEducationService } from '../../core/services/admin-education.service';
import { EducationDTO } from '../../core/models/education-dto.model';

type FormMode = 'list' | 'create' | 'edit';
type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-admin-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-education.component.html',
  styleUrls: ['./admin-education.component.scss'],
})
export class AdminEducationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // ── State ──────────────────────────────────────────────────
  mode: FormMode = 'list';
  fetchStatus: ApiStatus = 'loading';
  saveStatus: ApiStatus = 'idle';
  deletingId: string | null = null;

  education: EducationDTO[] = [];
  editingItem: EducationDTO | null = null;

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
    private eduService: AdminEducationService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.load();
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

  private buildForm(data?: EducationDTO): void {
    this.form = this.fb.group({
      stream:    [data?.stream    ?? '', [Validators.required]],
      clgName:   [data?.clgName   ?? '', [Validators.required]],
      startYear: [data?.startYear ?? null, [Validators.required, Validators.min(1900), Validators.max(2100)]],
      endYear:   [data?.endYear   ?? null, [Validators.min(1900), Validators.max(2100)]],
      marks:     [data?.marks     ?? ''],
      about: this.fb.array(
        (data?.about?.length ? data.about : ['']).map((p) =>
          this.fb.control(p, Validators.required),
        ),
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

  // ── Data ───────────────────────────────────────────────────

  load(): void {
    this.fetchStatus = 'loading';
    this.eduService.getEducation().subscribe({
      next: (res) => {
        this.education = res.data ?? [];
        this.fetchStatus = 'success';
      },
      error: () => {
        this.fetchStatus = 'error';
        this.education = [];
      },
    });
  }

  // ── Mode switching ─────────────────────────────────────────

  enterCreate(): void {
    this.editingItem = null;
    this.buildForm();
    this.mode = 'create';
    this.clearMessages();
  }

  enterEdit(item: EducationDTO): void {
    this.editingItem = item;
    this.buildForm(item);
    this.mode = 'edit';
    this.clearMessages();
  }

  cancelForm(): void {
    this.mode = 'list';
    this.editingItem = null;
    this.clearMessages();
  }

  // ── CRUD ───────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: EducationDTO = this.form.value;
    this.saveStatus = 'loading';
    this.clearMessages();

    if (this.mode === 'create') {
      this.eduService.createEducation(payload).subscribe({
        next: (res) => {
          this.saveStatus = 'success';
          this.successMsg = res.msg ?? 'Education record created successfully.';
          this.mode = 'list';
          this.load();
        },
        error: (err) => {
          this.saveStatus = 'error';
          this.errorMsg = this.extractError(err, 'Failed to create education record.');
        },
      });
    } else {
      const id = this.editingItem?.id!;
      this.eduService.updateEducation(id, payload).subscribe({
        next: (res) => {
          this.saveStatus = 'success';
          this.successMsg = res.msg ?? 'Education record updated successfully.';
          this.mode = 'list';
          this.load();
        },
        error: (err) => {
          this.saveStatus = 'error';
          this.errorMsg = this.extractError(err, 'Failed to update education record.');
        },
      });
    }
  }

  confirmDelete(item: EducationDTO): void {
    if (!item.id) return;
    if (!confirm(`Delete "${item.stream} — ${item.clgName}"? This cannot be undone.`)) return;

    this.deletingId = item.id;
    this.clearMessages();

    this.eduService.deleteEducation(item.id).subscribe({
      next: (res) => {
        this.deletingId = null;
        this.successMsg = res.msg ?? 'Education record deleted.';
        this.education = this.education.filter((e) => e.id !== item.id);
      },
      error: (err) => {
        this.deletingId = null;
        this.errorMsg = this.extractError(err, 'Failed to delete education record.');
      },
    });
  }


  // ── Helpers ────────────────────────────────────────────────

  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || !c.invalid || !c.touched) return '';
    if (c.errors?.['required'])  return `${name} is required.`;
    if (c.errors?.['min'])       return 'Must be 1900 or later.';
    if (c.errors?.['max'])       return 'Must be 2100 or earlier.';
    return 'Invalid value.';
  }

  private extractError(err: unknown, fallback: string): string {
    const e = err as { error?: { responseDTO?: { msg?: string }; msg?: string } };
    return e?.error?.responseDTO?.msg ?? e?.error?.msg ?? fallback;
  }

  private clearMessages(): void {
    this.errorMsg   = '';
    this.successMsg = '';
    this.saveStatus = 'idle';
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

    // Floating icosahedra (academic/geometric theme)
    const palette = [0x7c3aed, 0x06b6d4, 0xa855f7, 0x0ea5e9];
    for (let i = 0; i < 20; i++) {
      const size = 2 + Math.random() * 3;
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(size, 0),
        new THREE.MeshStandardMaterial({
          color: palette[i % palette.length],
          emissive: palette[i % palette.length],
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.28,
          wireframe: Math.random() > 0.4,
        }),
      );
      const rad = 38 + Math.random() * 38;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      mesh.position.set(
        rad * Math.sin(phi) * Math.cos(theta),
        rad * Math.sin(phi) * Math.sin(theta),
        rad * Math.cos(phi),
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.group.add(mesh);
    }

    // Starfield
    const pPos = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 340;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 340;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 340;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    this.scene.add(new THREE.Points(pGeo,
      new THREE.PointsMaterial({ size: 0.28, color: 0x475569, transparent: true, opacity: 0.4 })));

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0xa855f7, 2.5, 320);
    pl.position.set(0, 0, 60);
    this.scene.add(pl);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.group.rotation.y = t * 0.04 + this.mouse.x * 0.05;
    this.group.rotation.x = Math.sin(t * 0.03) * 0.1 + this.mouse.y * 0.03;
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
