import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { forkJoin } from 'rxjs';
import { EducationService } from '../core/services/education.service';
import { EducationRecord } from '../core/models/education.model';
import { CertificationService } from '../core/services/certification.service';
import { CertificationRecord } from '../core/models/certification.model';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss'],
})
export class EducationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  records: EducationRecord[] = [];
  certifications: CertificationRecord[] = [];
  loading = true;
  activeIndex: number | null = 0;
  certFilter = '';

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationId!: number;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);

  constructor(
    private educationService: EducationService,
    private certificationService: CertificationService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Sagar Desai | Academic Background & Certifications');
    this.meta.updateTag({
      name: 'description',
      content: 'View Sagar Desai\'s educational qualifications, computer science degree credentials, and technical engineering certifications.'
    });

    forkJoin({
      education: this.educationService.getEducation(),
      certifications: this.certificationService.getCertifications(),
    }).subscribe({
      next: ({ education, certifications }) => {
        this.records = education;
        this.certifications = certifications;
        this.loading = false;
        this.activeIndex = education.length > 0 ? 0 : null;
      },
      error: () => { this.loading = false; },
    });
  }

  get filteredCerts(): CertificationRecord[] {
    const q = this.certFilter.toLowerCase().trim();
    if (!q) return this.certifications;
    return this.certifications.filter(
      (c) =>
        c.techSkill.toLowerCase().includes(q) ||
        c.certificationName.toLowerCase().includes(q) ||
        String(c.year).includes(q),
    );
  }

  onCertFilter(event: Event): void {
    this.certFilter = (event.target as HTMLInputElement).value;
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

  toggle(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  getIcon(index: number): string {
    return ['🎓', '🏫', '📚'][index] ?? '📖';
  }

  isPresent(end: number | 'Present'): boolean {
    return end === 'Present';
  }

  getDuration(start: number, end: number | 'Present'): number {
    const endYear = end === 'Present' ? new Date().getFullYear() : end;
    return endYear - start;
  }

  // ── Three.js ─────────────────────────────────────────────

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Floating torus knot — represents "knowledge loops"
    const knotGeo = new THREE.TorusKnotGeometry(22, 4, 160, 20, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x3b0764,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    this.group.add(knot);

    // Outer glow ring
    const ringGeo = new THREE.TorusGeometry(38, 0.6, 8, 120);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    this.group.add(ring);

    // Starfield backdrop
    const starCount = 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 300;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 300;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.32, color: 0x94a3b8, transparent: true, opacity: 0.55 });
    this.scene.add(new THREE.Points(starGeo, starMat));

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xa855f7, 1.5);
    dirLight.position.set(50, 50, 80);
    this.scene.add(dirLight);
    const blueLight = new THREE.PointLight(0x06b6d4, 1.2, 250);
    blueLight.position.set(-60, -40, 60);
    this.scene.add(blueLight);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.group.rotation.y = t * 0.12 + this.mouse.x * 0.15;
    this.group.rotation.x = Math.sin(t * 0.08) * 0.2 + this.mouse.y * 0.08;
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
