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
import { AboutService } from '../core/services/about.service';
import { AboutData } from '../core/models/about.model';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  about: AboutData | null = null;
  loading = true;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particles!: THREE.Points;
  private animationId!: number;
  private mouse = new THREE.Vector2(0, 0);

  constructor(
    private aboutService: AboutService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Sagar Desai | Portfolio - Full Stack Software Developer');
    this.meta.updateTag({
      name: 'description',
      content: 'Welcome to Sagar Desai\'s portfolio. Discover full stack software engineering projects, core technologies, and professional experience.'
    });

    this.aboutService.getAbout().subscribe({
      next: (data) => {
        this.about = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
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

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.z = 80;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Particle field ---
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const spread = 200;

    const palette = [
      new THREE.Color(0x7c3aed), // violet
      new THREE.Color(0x06b6d4), // cyan
      new THREE.Color(0xa855f7), // purple
      new THREE.Color(0x38bdf8), // sky
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.particles.rotation.y += 0.0008 + this.mouse.x * 0.0003;
    this.particles.rotation.x += 0.0003 + this.mouse.y * 0.0002;
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
