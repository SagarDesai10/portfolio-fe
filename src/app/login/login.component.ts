import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  form!: FormGroup;
  loading = false;
  errorMsg = '';
  showPassword = false;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationId!: number;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Already logged in → redirect
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/about']);
    }

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
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

  // ── Helpers ──────────────────────────────────────────────

  get username() { return this.form.get('username')!; }
  get password() { return this.form.get('password')!; }

  get usernameError(): string {
    if (this.username.errors?.['required'])   return 'Username is required.';
    if (this.username.errors?.['minlength'])  return 'Minimum 3 characters.';
    return '';
  }

  get passwordError(): string {
    if (this.password.errors?.['required'])  return 'Password is required.';
    if (this.password.errors?.['minlength']) return 'Minimum 4 characters.';
    return '';
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    const { username, password } = this.form.value;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/about']);
      },
      error: (err: Error) => {
        this.loading  = false;
        this.errorMsg = err.message;
      },
    });
  }

  // ── Three.js ─────────────────────────────────────────────

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

    // Central dodecahedron — represents "key / lock"
    const dodGeo = new THREE.DodecahedronGeometry(22, 0);
    const dodMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed, emissive: 0x3b0764, emissiveIntensity: 0.6,
      wireframe: true, transparent: true, opacity: 0.35,
    });
    this.group.add(new THREE.Mesh(dodGeo, dodMat));

    // Outer orbit ring
    const ringGeo = new THREE.TorusGeometry(36, 0.5, 8, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.7,
      transparent: true, opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    this.group.add(ring);

    // Second tilted ring
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(50, 0.4, 8, 100),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.5,
        transparent: true, opacity: 0.2,
      }),
    );
    ring2.rotation.y = Math.PI / 3;
    this.group.add(ring2);

    // Floating particles
    const pCount = 1600;
    const pPos    = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const palette = [new THREE.Color(0x7c3aed), new THREE.Color(0x06b6d4), new THREE.Color(0xa855f7)];
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 280;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 280;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 280;
      const c = palette[i % palette.length];
      pColors[i * 3] = c.r; pColors[i * 3 + 1] = c.g; pColors[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    this.scene.add(new THREE.Points(pGeo,
      new THREE.PointsMaterial({ size: 0.38, vertexColors: true, transparent: true, opacity: 0.6 })));

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0x7c3aed, 2.5, 300);
    pl.position.set(0, 0, 60); this.scene.add(pl);
    const pl2 = new THREE.PointLight(0x06b6d4, 1.5, 300);
    pl2.position.set(-60, 40, 30); this.scene.add(pl2);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.group.rotation.y = t * 0.1 + this.mouse.x * 0.07;
    this.group.rotation.x = Math.sin(t * 0.05) * 0.15 + this.mouse.y * 0.05;
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
