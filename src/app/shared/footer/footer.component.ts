import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  readonly quickLinks = [
    { label: 'About',      path: '/about' },
    { label: 'Experience', path: '/experience' },
    { label: 'Education',  path: '/education' },
    { label: 'Skills',     path: '/skills' },
    { label: 'Projects',   path: '/projects' },
    { label: 'Contact',    path: '/contact' },
  ];
}
