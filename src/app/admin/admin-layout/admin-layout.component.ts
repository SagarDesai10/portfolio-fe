import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  sidebarOpen = true;

  readonly navItems: NavItem[] = [
    { label: 'About',        icon: '👤', route: '/admin/about'       },
    { label: 'Experience',   icon: '💼', route: '/admin/experience'  },
    { label: 'Education',    icon: '🎓', route: '/admin/education'   },
    { label: 'Skills',       icon: '⚡', route: '/admin/skill'       },
    { label: 'Projects',     icon: '🚀', route: '/admin/project'     },
    { label: 'Certificate',  icon: '📜', route: '/admin/certificate' },
    { label: 'Social Links', icon: '🔗', route: '/admin/social-link' },
  ];

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
