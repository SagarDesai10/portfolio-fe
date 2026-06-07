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
import { ProjectService } from '../core/services/project.service';
import { Project } from '../core/models/project.model';
import { Title, Meta } from '@angular/platform-browser';

interface CategoryTab {
  key: string;
  label: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = true;
  activeCategory = 'All';
  categories: CategoryTab[] = [];

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationId!: number;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);

  constructor(
    private projectService: ProjectService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Sagar Desai | Software Engineering Showcase');
    this.meta.updateTag({
      name: 'description',
      content: 'Browse Sagar Desai\'s development project portfolio, featuring personal application builds, open-source repositories, and live project links.'
    });

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.allProjects = data;
        this.filteredProjects = data;
        // Build categories dynamically from the data
        const unique = [...new Set(data.map(p => p.category))].sort();
        this.categories = [
          { key: 'All', label: 'All' },
          ...unique.map(c => ({ key: c, label: c })),
        ];
        this.loading = false;
      },
      error: () => { this.loading = false; },
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

  selectCategory(cat: string): void {
    this.activeCategory = cat;
    this.filteredProjects = cat === 'All'
      ? this.allProjects
      : this.allProjects.filter((p) => p.category === cat);
  }

  countFor(cat: string): number {
    return cat === 'All'
      ? this.allProjects.length
      : this.allProjects.filter((p) => p.category === cat).length;
  }

  getCategoryClass(cat: string): string {
    return cat.toLowerCase().replace(/\s+/g, '-');
  }

  trackByName(_: number, p: Project): string { return p.name; }

  // ── Three.js — drifting geometric lattice ────────────────

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    this.camera.position.z = 110;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Outer wireframe octahedron
    const oct1 = new THREE.Mesh(
      new THREE.OctahedronGeometry(40, 2),
      new THREE.MeshStandardMaterial({
        color: 0x7c3aed, emissive: 0x3b0764, emissiveIntensity: 0.5,
        wireframe: true, transparent: true, opacity: 0.25,
      }),
    );
    this.group.add(oct1);

    // Inner counter-rotating octahedron
    const oct2 = new THREE.Mesh(
      new THREE.OctahedronGeometry(24, 1),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4, emissive: 0x0e7490, emissiveIntensity: 0.5,
        wireframe: true, transparent: true, opacity: 0.3,
      }),
    );
    oct2.userData['reverse'] = true;
    this.group.add(oct2);

    // Floating tech dots — random colour palette
    const palette = [0x7c3aed, 0x06b6d4, 0xa855f7, 0x0ea5e9, 0xf59e0b, 0x22c55e];
    for (let i = 0; i < 40; i++) {
      const r = 50 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 8, 8),
        new THREE.MeshStandardMaterial({
          color: palette[i % palette.length],
          emissive: palette[i % palette.length],
          emissiveIntensity: 0.6,
          roughness: 0.3, metalness: 0.5,
        }),
      );
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
      this.group.add(mesh);
    }

    // Background particles
    const pPos = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 300;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 300;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    this.scene.add(new THREE.Points(pGeo,
      new THREE.PointsMaterial({ size: 0.3, color: 0x475569, transparent: true, opacity: 0.5 })));

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const pl1 = new THREE.PointLight(0x7c3aed, 2.5, 300);
    pl1.position.set(0, 0, 70); this.scene.add(pl1);
    const pl2 = new THREE.PointLight(0x06b6d4, 1.5, 300);
    pl2.position.set(-80, 50, 40); this.scene.add(pl2);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.group.children.forEach((child) => {
      if ((child as THREE.Mesh).userData?.['reverse']) {
        child.rotation.y = -t * 0.09;
        child.rotation.x = -t * 0.06;
      }
    });
    this.group.rotation.y = t * 0.06 + this.mouse.x * 0.07;
    this.group.rotation.x = Math.sin(t * 0.04) * 0.1 + this.mouse.y * 0.05;
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
