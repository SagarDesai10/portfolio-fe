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
import * as THREE from 'three';
import { SocialLinkService } from '../core/services/social-link.service';
import { ContactService } from '../core/services/contact.service';
import { SocialLink } from '../core/models/social-link.model';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  socialLinks: SocialLink[] = [];
  form!: FormGroup;
  formStatus: FormStatus = 'idle';

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationId!: number;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);

  constructor(
    private fb: FormBuilder,
    private socialLinkService: SocialLinkService,
    private contactService: ContactService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });

    this.socialLinkService.getSocialLinks().subscribe({
      next: (links) => (this.socialLinks = links),
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

  get email() { return this.form.get('email')!; }
  get message() { return this.form.get('message')!; }

  get emailError(): string {
    if (this.email.errors?.['required']) return 'Email is required.';
    if (this.email.errors?.['email'])    return 'Please enter a valid email address.';
    return '';
  }

  get messageError(): string {
    if (this.message.errors?.['required'])   return 'Message is required.';
    if (this.message.errors?.['minlength'])  return 'Message must be at least 10 characters.';
    if (this.message.errors?.['maxlength'])  return 'Message must be under 1000 characters.';
    return '';
  }

  get charCount(): number { return (this.message.value ?? '').length; }

  isIconUrl(icon: string): boolean {
    return icon.startsWith('http') || icon.startsWith('data:');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formStatus = 'sending';
    this.contactService.sendMessage(this.form.value).subscribe({
      next: () => {
        this.formStatus = 'success';
        this.form.reset();
      },
      error: () => {
        this.formStatus = 'error';
      },
    });
  }

  resetForm(): void {
    this.formStatus = 'idle';
    this.form.reset();
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

    // Icosahedron wireframe — "connected" feel for contact
    const icoGeo = new THREE.IcosahedronGeometry(28, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x3b0764,
      emissiveIntensity: 0.55,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    this.group.add(new THREE.Mesh(icoGeo, icoMat));

    // Second, slightly larger icosahedron, different phase
    const ico2 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(38, 1),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0e7490,
        emissiveIntensity: 0.4,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      }),
    );
    this.group.add(ico2);

    // Floating particles
    const pCount = 1500;
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const palette = [
      new THREE.Color(0x7c3aed),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7),
    ];
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
    this.scene.add(new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ size: 0.38, vertexColors: true, transparent: true, opacity: 0.65 }),
    ));

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0x7c3aed, 2, 200);
    pl.position.set(0, 0, 60);
    this.scene.add(pl);
    const pl2 = new THREE.PointLight(0x06b6d4, 1.5, 200);
    pl2.position.set(-60, 40, 30);
    this.scene.add(pl2);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.group.rotation.x = t * 0.07 + this.mouse.y * 0.06;
    this.group.rotation.y = t * 0.11 + this.mouse.x * 0.06;
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
