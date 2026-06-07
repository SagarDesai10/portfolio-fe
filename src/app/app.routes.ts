import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ExperienceComponent } from './experience/experience.component';
import { EducationComponent } from './education/education.component';
import { ContactComponent } from './contact/contact.component';
import { SkillsComponent } from './skills/skills.component';
import { ProjectsComponent } from './projects/projects.component';
import { LoginComponent } from './login/login.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminAboutComponent } from './admin/about/admin-about.component';
import { AdminCertificateComponent } from './admin/certificate/admin-certificate.component';
import { AdminEducationComponent } from './admin/education/admin-education.component';
import { AdminExperienceComponent } from './admin/experience/admin-experience.component';
import { AdminProjectComponent } from './admin/project/admin-project.component';
import { AdminSkillComponent } from './admin/skill/admin-skill.component';
import { AdminSocialLinkComponent } from './admin/social-link/admin-social-link.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'about', pathMatch: 'full' },
  { path: 'about',      component: AboutComponent },
  { path: 'experience', component: ExperienceComponent },
  { path: 'education',  component: EducationComponent },
  { path: 'contact',    component: ContactComponent },
  { path: 'skills',     component: SkillsComponent },
  { path: 'projects',   component: ProjectsComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '',            redirectTo: 'about', pathMatch: 'full' },
      { path: 'about',       component: AdminAboutComponent },
      { path: 'certificate', component: AdminCertificateComponent },
      { path: 'education',   component: AdminEducationComponent },
      { path: 'experience',  component: AdminExperienceComponent },
      { path: 'project',     component: AdminProjectComponent },
      { path: 'skill',       component: AdminSkillComponent },
      { path: 'social-link', component: AdminSocialLinkComponent },
    ],
  },
];
