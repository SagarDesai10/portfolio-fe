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
import { SkillsService } from '../core/services/skills.service';
import { Skill, SkillCategory } from '../core/models/skill.model';

interface CategoryTab {
  key: SkillCategory;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  loading = true;
  activeCategory: SkillCategory = 'All';
  hoveredIndex: number | null = null;

  readonly categories: CategoryTab[] = [
    { key: 'All',    label: 'All',      icon: '⚡' },
    { key: 'FE',     label: 'Frontend', icon: '🖥️' },
    { key: 'BE',     label: 'Backend',  icon: '⚙️' },
    { key: 'DB',     label: 'Database', icon: '🗄️' },
    { key: 'DevOps', label: 'DevOps',   icon: '🚀' },
    { key: 'DSA',    label: 'DSA',      icon: '🧠' },
    { key: 'Tools',  label: 'Tools',    icon: '🛠️' },
  ];

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationId!: number;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);

  constructor(private skillsService: SkillsService) {}

  ngOnInit(): void {
    this.skillsService.getSkills().subscribe({
      next: (data) => {
        this.allSkills = data;
        this.filteredSkills = data;
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

  selectCategory(cat: SkillCategory): void {
    this.activeCategory = cat;
    this.filteredSkills = cat === 'All'
      ? this.allSkills
      : this.allSkills.filter((s) => s.category === cat);
  }

  get avgStars(): number {
    if (!this.filteredSkills.length) return 0;
    const sum = this.filteredSkills.reduce((acc, s) => acc + s.stars, 0);
    return Math.round(sum / this.filteredSkills.length);
  }

  countFor(cat: SkillCategory): number {
    return cat === 'All'
      ? this.allSkills.length
      : this.allSkills.filter((s) => s.category === cat).length;
  }

  stars(n: number): number[] { return Array(n).fill(0); }
  emptyStars(n: number): number[] { return Array(5 - n).fill(0); }

  isEmoji(img: string): boolean {
    return !img.startsWith('http') && !img.startsWith('data:');
  }

  trackByName(_: number, s: Skill): string { return s.name; }

  // ── Three.js — floating node network ────────────────────

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    this.camera.position.z = 120;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // ── Nodes (small spheres at random positions)
    const palette = [0x7c3aed, 0x06b6d4, 0xa855f7, 0x0ea5e9, 0x38bdf8, 0xf59e0b];
    const nodeCount = 55;
    const positions: THREE.Vector3[] = [];
    const spread = 80;

    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
      );
      positions.push(pos);

      const geo = new THREE.SphereGeometry(0.55 + Math.random() * 0.4, 10, 10);
      const mat = new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        emissive: palette[i % palette.length],
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this.group.add(mesh);
    }

    // ── Edges (lines between nearby nodes)
    const edgePositions: number[] = [];
    const connectDist = 30;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (positions[i].distanceTo(positions[j]) < connectDist) {
          edgePositions.push(
            positions[i].x, positions[i].y, positions[i].z,
            positions[j].x, positions[j].y, positions[j].z,
          );
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.18 });
    this.group.add(new THREE.LineSegments(lineGeo, lineMat));

    // ── Background starfield
    const starPos = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 300;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 300;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ size: 0.3, color: 0x475569, transparent: true, opacity: 0.5 }),
    ));

    // ── Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0x7c3aed, 2, 300);
    pl.position.set(0, 0, 80);
    this.scene.add(pl);
    const pl2 = new THREE.PointLight(0x06b6d4, 1.5, 300);
    pl2.position.set(-80, 50, 40);
    this.scene.add(pl2);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.group.rotation.y = t * 0.06 + this.mouse.x * 0.08;
    this.group.rotation.x = Math.sin(t * 0.04) * 0.15 + this.mouse.y * 0.05;
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
