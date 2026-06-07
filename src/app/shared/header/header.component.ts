import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  scrolled = false;
  menuOpen = false;

  readonly navLinks: NavLink[] = [
    { label: 'About',      path: '/about' },
    { label: 'Experience', path: '/experience' },
    { label: 'Education',  path: '/education' },
    { label: 'Skills',     path: '/skills' },
    { label: 'Projects',   path: '/projects' },
    { label: 'Contact',    path: '/contact' },
  ];

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
