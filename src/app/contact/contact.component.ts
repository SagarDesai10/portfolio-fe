import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as THREE from 'three';
import { SocialLinkService } from '../core/services/social-link.service';
import { ContactService } from '../core/services/contact.service';
import { SocialLink } from '../core/models/social-link.model';
import { AboutService } from '../core/services/about.service';
import { Title, Meta } from '@angular/platform-browser';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';
type ContactMode = 'chat' | 'cli';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  type?: 'text' | 'choices';
  choices?: string[];
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('matrixCanvas') matrixCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  socialLinks: SocialLink[] = [];
  form!: FormGroup;
  formStatus: FormStatus = 'idle';

  // Dynamic Email from Backend
  sagarEmail = 'sagardesai.developer@gmail.com';

  // Mode Selection
  activeMode: ContactMode = 'chat';

  // --- Chatbot Mode state ---
  chatInput = '';
  chatMessages: ChatMessage[] = [];
  isBotTyping = false;
  chatStep: 'email' | 'topic' | 'message' | 'sending' | 'success' | 'error' = 'email';
  userEmail = '';
  userTopic = '';
  userMessage = '';
  readonly chatTopics = [
    '💼 Job Opportunity / Hiring',
    '🚀 Project Collaboration',
    '👋 Say Hello!',
    '💡 Feedback / Suggestions'
  ];

  // --- CLI Mode state ---
  cliInput = '';
  cliOutput: string[] = [];
  cliHistory: string[] = [];
  historyIndex = -1;
  isMatrixActive = false;
  isCliEmailFlowActive = false;
  cliEmailStep: 'email' | 'message' | 'confirm' | 'inactive' = 'inactive';
  cliTempEmail = '';
  cliTempMessage = '';

  // --- Three.js state ---
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationId!: number;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);

  // --- Matrix Rain state ---
  private matrixCtx!: CanvasRenderingContext2D;
  private matrixIntervalId: any;

  constructor(
    private fb: FormBuilder,
    private socialLinkService: SocialLinkService,
    private contactService: ContactService,
    private aboutService: AboutService,
    private title: Title,
    private meta: Meta,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Sagar Desai | Connect & Hire - Contact Information');
    this.meta.updateTag({
      name: 'description',
      content: 'Connect with Sagar Desai for software engineering positions, contract roles, or project collaborations. Direct email and social networks.'
    });

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });

    this.socialLinkService.getSocialLinks().subscribe({
      next: (links) => (this.socialLinks = links),
    });

    // Fetch dynamic email from backend
    this.aboutService.getAbout().subscribe({
      next: (about) => {
        if (about.email) {
          this.sagarEmail = about.email;
        }
      },
      error: () => {} // keep fallback
    });

    // Initialize Chat messages
    this.initChatMessages();

    // Initialize CLI Welcome
    this.initCliWelcome();
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('resize', this.onResize.bind(this));
    this.stopMatrix();
  }

  // ── Mode Toggle ──────────────────────────────────────────

  switchMode(mode: ContactMode): void {
    if (this.activeMode === mode) return;
    this.activeMode = mode;
    this.stopMatrix();

    if (mode === 'cli') {
      setTimeout(() => {
        // focus the CLI input element
        const el = document.getElementById('cli-terminal-input');
        if (el) el.focus();
      }, 50);
    } else {
      this.scrollToBottom();
    }
  }

  // ── Chatbot Mode Logic ────────────────────────────────────

  private initChatMessages(): void {
    this.chatMessages = [];
    this.isBotTyping = true;
    setTimeout(() => {
      this.chatMessages.push({
        sender: 'bot',
        text: "Hey there! I'm Sagar's Virtual Assistant. 🤖",
        timestamp: new Date()
      });
      this.isBotTyping = false;
      this.scrollToBottom();
      this.cdr.markForCheck();

      // Second message
      setTimeout(() => {
        this.isBotTyping = true;
        this.chatMessages.push({
          sender: 'bot',
          text: "I can help you send a direct email to Sagar, or list his socials. To get started, what is your email address?",
          timestamp: new Date()
        });
        this.isBotTyping = false;
        this.scrollToBottom();
        this.cdr.markForCheck();
      }, 1000);
    }, 500);
  }

  onChatSubmit(): void {
    const text = this.chatInput.trim();
    if (!text) return;

    this.chatInput = '';
    this.chatMessages.push({ sender: 'user', text, timestamp: new Date() });
    this.scrollToBottom();
    this.cdr.markForCheck();

    this.processChatStep(text);
  }

  private processChatStep(input: string): void {
    this.isBotTyping = true;
    this.scrollToBottom();

    setTimeout(() => {
      if (this.chatStep === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          this.chatMessages.push({
            sender: 'bot',
            text: "Oops, that doesn't look like a valid email. Please enter a proper email address so Sagar can reply to you:",
            timestamp: new Date()
          });
        } else {
          this.userEmail = input;
          this.chatStep = 'topic';
          this.chatMessages.push({
            sender: 'bot',
            text: "Awesome! What is the reason you are getting in touch today?",
            timestamp: new Date(),
            type: 'choices',
            choices: this.chatTopics
          });
        }
      } else if (this.chatStep === 'message') {
        if (input.length < 10) {
          this.chatMessages.push({
            sender: 'bot',
            text: "Your message is a bit short. Please write at least 10 characters so Sagar has enough detail to reply:",
            timestamp: new Date()
          });
        } else {
          this.userMessage = input;
          this.chatStep = 'sending';
          this.chatMessages.push({
            sender: 'bot',
            text: "Alright, transferring your transmission to the server... 🚀",
            timestamp: new Date()
          });

          this.cdr.markForCheck();
          this.isBotTyping = false;
          this.sendContactData();
          return;
        }
      }
      this.isBotTyping = false;
      this.scrollToBottom();
      this.cdr.markForCheck();
    }, 1000);
  }

  onChatChoiceSelect(choice: string): void {
    this.chatMessages.push({ sender: 'user', text: choice, timestamp: new Date() });
    this.userTopic = choice;
    this.chatStep = 'message';
    this.scrollToBottom();
    this.cdr.markForCheck();

    this.isBotTyping = true;
    setTimeout(() => {
      this.chatMessages.push({
        sender: 'bot',
        text: "Got it! Go ahead and write your detailed message below. I will forward it to Sagar directly.",
        timestamp: new Date()
      });
      this.isBotTyping = false;
      this.scrollToBottom();
      this.cdr.markForCheck();
    }, 800);
  }

  getMailtoLink(): string {
    const subject = encodeURIComponent(`Portfolio Inquiry: ${this.userTopic || 'General'}`);
    const body = encodeURIComponent(`From: ${this.userEmail}\n\nMessage:\n${this.userMessage}`);
    return `mailto:${this.sagarEmail}?subject=${subject}&body=${body}`;
  }

  downloadVCard(): void {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Sagar Desai
TITLE:Full Stack Software Developer
EMAIL;TYPE=INTERNET:${this.sagarEmail}
URL:${window.location.origin}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sagar_Desai_Contact.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  emailCopied = false;
  copyEmailToClipboard(): boolean {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.sagarEmail);
      this.emailCopied = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.emailCopied = false;
        this.cdr.markForCheck();
      }, 2000);
      return true;
    }
    return false;
  }

  private sendContactData(): void {
    this.chatStep = 'success';
    this.chatMessages.push({
      sender: 'bot',
      text: `Draft prepared! Hitting the "Send Email ✉️" button below will open your local email client pre-filled with the message, so you can send it directly to: ${this.sagarEmail}.`,
      timestamp: new Date()
    });
    this.cdr.markForCheck();
    this.scrollToBottom();
  }

  resetChat(): void {
    this.chatStep = 'email';
    this.userEmail = '';
    this.userTopic = '';
    this.userMessage = '';
    this.chatInput = '';
    this.initChatMessages();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        const el = this.chatScrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (err) {}
    }, 100);
  }

  // ── CLI Mode Logic ───────────────────────────────────────

  private initCliWelcome(): void {
    this.cliOutput = [
      '===========================================================',
      'SAGAR OS v1.2.0 - SECURE PROTOCOL TERMINAL',
      '===========================================================',
      'Welcome guest! Establish a direct hook with Sagar Desai.',
      "Type 'help' to list available communications commands.",
      '===========================================================',
      ''
    ];
  }

  onCliSubmit(): void {
    const input = this.cliInput.trim();
    this.cliInput = '';
    if (!input) return;

    // Save to history
    this.cliHistory.push(input);
    this.historyIndex = this.cliHistory.length;

    // Print echo command
    this.cliOutput.push(`guest@sagar-os:~$ ${input}`);

    if (this.isMatrixActive) {
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        this.stopMatrix();
        this.cliOutput.push('Matrix mode deactivated. Returning to shell.');
      } else {
        this.cliOutput.push("Matrix rain is running. Type 'exit' to quit Matrix code.");
      }
      this.scrollToTerminalBottom();
      return;
    }

    if (this.isCliEmailFlowActive) {
      this.handleCliEmailWizard(input);
      this.scrollToTerminalBottom();
      return;
    }

    this.processCliCommand(input);
    this.scrollToTerminalBottom();
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardEvents(event: KeyboardEvent): void {
    if (this.activeMode !== 'cli') return;

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.cliHistory.length > 0 && this.historyIndex > 0) {
        this.historyIndex--;
        this.cliInput = this.cliHistory[this.historyIndex];
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.cliHistory.length > 0 && this.historyIndex < this.cliHistory.length - 1) {
        this.historyIndex++;
        this.cliInput = this.cliHistory[this.historyIndex];
      } else {
        this.historyIndex = this.cliHistory.length;
        this.cliInput = '';
      }
    } else if (event.key === 'Escape') {
      if (this.isMatrixActive) {
        this.stopMatrix();
        this.cliOutput.push('Matrix mode deactivated via ESC. Returning to shell.');
        this.cdr.markForCheck();
      }
    }
  }

  getCliMailtoLink(): string {
    const subject = encodeURIComponent(`Portfolio Inquiry from CLI`);
    const body = encodeURIComponent(`From: ${this.cliTempEmail}\n\nMessage:\n${this.cliTempMessage}`);
    return `mailto:${this.sagarEmail}?subject=${subject}&body=${body}`;
  }

  private handleCliEmailWizard(input: string): void {
    if (this.cliEmailStep === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        this.cliOutput.push('[ERROR] Invalid email format. Try again:');
      } else {
        this.cliTempEmail = input;
        this.cliEmailStep = 'message';
        this.cliOutput.push('[OK] Email address verified.');
        this.cliOutput.push('Enter your message (minimum 10 characters):');
      }
    } else if (this.cliEmailStep === 'message') {
      if (input.length < 10) {
        this.cliOutput.push('[ERROR] Message too short. Write at least 10 chars:');
      } else {
        this.cliTempMessage = input;
        this.cliEmailStep = 'confirm';
        this.cliOutput.push(`[OK] Message length: ${input.length} chars.`);
        this.cliOutput.push('');
        this.cliOutput.push('--- TRANSMISSION DRAFT ---');
        this.cliOutput.push(`To: Sagar Desai`);
        this.cliOutput.push(`From: ${this.cliTempEmail}`);
        this.cliOutput.push(`Content: ${this.cliTempMessage}`);
        this.cliOutput.push('--------------------------');
        this.cliOutput.push('Would you like to compile this local email draft now? (y/n):');
      }
    } else if (this.cliEmailStep === 'confirm') {
      const choice = input.toLowerCase();
      if (choice === 'y' || choice === 'yes') {
        this.cliOutput.push('[INFO] Compiling local email draft...');
        const mailto = this.getCliMailtoLink();
        if (typeof window !== 'undefined') {
          window.location.href = mailto;
        }
        this.cliOutput.push('[SUCCESS] Local mail client triggered.');
        this.cliOutput.push(`Please send the pre-filled email to: ${this.sagarEmail}`);
        this.cliOutput.push('Tip: Type "vcard" to download Sagar\'s contact card, or "copy" to copy email.');
        this.resetCliEmailFlow();
      } else if (choice === 'n' || choice === 'no') {
        this.cliOutput.push('[INFO] Transmission aborted.');
        this.resetCliEmailFlow();
      } else {
        this.cliOutput.push('Invalid option. Type "y" for yes, or "n" for no:');
      }
    }
  }

  private resetCliEmailFlow(): void {
    this.isCliEmailFlowActive = false;
    this.cliEmailStep = 'inactive';
    this.cliTempEmail = '';
    this.cliTempMessage = '';
  }

  private processCliCommand(input: string): void {
    const tokens = input.toLowerCase().split(' ');
    const command = tokens[0];

    switch (command) {
      case 'help':
        this.cliOutput.push('Available commands:');
        this.cliOutput.push('  email    - Start the interactive email wizard');
        this.cliOutput.push('  copy     - Copy Sagar\'s email to your clipboard');
        this.cliOutput.push('  vcard    - Download Sagar\'s Contact Card (.vcf file)');
        this.cliOutput.push('  socials  - Display Sagar\'s active networks and URLs');
        this.cliOutput.push('  about    - Print Sagar\'s short developer bio');
        this.cliOutput.push('  ping     - Verify network latency to Sagar\'s backend');
        this.cliOutput.push('  matrix   - Load visual digital code rain in terminal');
        this.cliOutput.push('  clear    - Clear terminal screen buffer');
        this.cliOutput.push('  toggle   - Return to Chatbot Assistant mode');
        break;

      case 'email':
        this.isCliEmailFlowActive = true;
        this.cliEmailStep = 'email';
        this.cliOutput.push('----------------------------------------------------');
        this.cliOutput.push('EMAIL INITIATION SUBSYSTEM');
        this.cliOutput.push('Please enter your email address:');
        break;

      case 'copy':
        const copied = this.copyEmailToClipboard();
        if (copied) {
          this.cliOutput.push(`[SUCCESS] Email address copied to clipboard: ${this.sagarEmail}`);
        } else {
          this.cliOutput.push(`[ERROR] Clipboard access denied. Direct address: ${this.sagarEmail}`);
        }
        break;

      case 'vcard':
        this.cliOutput.push('[INFO] Generating vCard contact file...');
        this.downloadVCard();
        this.cliOutput.push('[SUCCESS] Contact Card downloaded: Sagar_Desai_Contact.vcf');
        break;

      case 'socials':
        this.cliOutput.push('Fetching configured social networks...');
        this.cliOutput.push('+------------------+-----------------------------------------------+');
        this.cliOutput.push('| NETWORK          | ADDRESS                                       |');
        this.cliOutput.push('+------------------+-----------------------------------------------+');
        if (this.socialLinks.length === 0) {
          this.cliOutput.push('| Loading...       | Please wait a second...                      |');
        } else {
          this.socialLinks.forEach(link => {
            const net = link.name.padEnd(16);
            const address = link.link.padEnd(45);
            this.cliOutput.push(`| ${net} | ${address} |`);
          });
        }
        this.cliOutput.push('+------------------+-----------------------------------------------+');
        this.cliOutput.push('(Hover & click the cards on the left panel to open them directly!)');
        break;

      case 'about':
        this.cliOutput.push('------------------------------------------------------------');
        this.cliOutput.push('SAGAR DESAI - FULL STACK SOFTWARE DEVELOPER');
        this.cliOutput.push('------------------------------------------------------------');
        this.cliOutput.push('Specialization: Angular, Next.js, Node.js, Spring Boot, SQL');
        this.cliOutput.push('Focus: Building clean UI/UX with robust microservices.');
        this.cliOutput.push('Status: Active & looking for exciting opportunities!');
        this.cliOutput.push('------------------------------------------------------------');
        break;

      case 'ping':
        this.cliOutput.push('PING portfolio-be-ywga.onrender.com (104.248.60.43): 56 data bytes');
        this.cliOutput.push('64 bytes from 104.248.60.43: icmp_seq=1 ttl=52 time=44.2 ms');
        this.cliOutput.push('64 bytes from 104.248.60.43: icmp_seq=2 ttl=52 time=42.7 ms');
        this.cliOutput.push('64 bytes from 104.248.60.43: icmp_seq=3 ttl=52 time=41.9 ms');
        this.cliOutput.push('--- portfolio-be ping statistics ---');
        this.cliOutput.push('3 packets transmitted, 3 packets received, 0% packet loss');
        this.cliOutput.push('round-trip min/avg/max = 41.9/42.9/44.2 ms');
        break;

      case 'matrix':
        this.startMatrix();
        break;

      case 'clear':
        this.cliOutput = [];
        break;

      case 'toggle':
        this.switchMode('chat');
        break;

      default:
        this.cliOutput.push(`[ERROR] Command not recognized: '${command}'. Type 'help' for options.`);
        break;
    }
  }

  private scrollToTerminalBottom(): void {
    setTimeout(() => {
      const el = document.getElementById('cli-output-container');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

  // --- Matrix Code Rain Canvas ---

  private startMatrix(): void {
    this.isMatrixActive = true;
    this.cdr.detectChanges(); // forces canvas mount in DOM

    const canvas = this.matrixCanvasRef.nativeElement;
    this.matrixCtx = canvas.getContext('2d')!;

    // resize to parent container size
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const matrixChars = "0101101010110100101010111001010101010101001101010101011";
    const alphabet = matrixChars.split("");

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const rainDrops: number[] = [];

    for (let x = 0; x < columns; x++) {
      rainDrops[x] = 1;
    }

    const draw = () => {
      this.matrixCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
      this.matrixCtx.fillRect(0, 0, canvas.width, canvas.height);

      this.matrixCtx.fillStyle = "#0F0"; // matrix neon green
      this.matrixCtx.font = fontSize + "px monospace";

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        this.matrixCtx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    this.matrixIntervalId = setInterval(draw, 33);
  }

  private stopMatrix(): void {
    this.isMatrixActive = false;
    if (this.matrixIntervalId) {
      clearInterval(this.matrixIntervalId);
      this.matrixIntervalId = null;
    }
  }

  hasValidIcon(icon: string | null | undefined): boolean {
    if (!icon) return false;
    const trimmed = icon.trim();
    return trimmed.startsWith('http') || trimmed.startsWith('data:');
  }

  isEmoji(icon: string | null | undefined): boolean {
    if (!icon) return false;
    const trimmed = icon.trim();
    if (trimmed.startsWith('http') || trimmed.startsWith('data:')) return false;
    return trimmed.length > 0 && trimmed.length <= 4;
  }

  getFallbackIcon(name: string): string {
    if (!name) return '🔗';
    const n = name.toLowerCase().trim();
    if (n.includes('github')) return '💻';
    if (n.includes('linkedin')) return '💼';
    if (n.includes('email') || n.includes('mail')) return '✉️';
    if (n.includes('twitter') || n.includes('x.com')) return '🐦';
    if (n.includes('instagram')) return '📸';
    if (n.includes('facebook')) return '👥';
    if (n.includes('leetcode')) return '🔣';
    return '🔗';
  }

  // ── Three.js Scene ──

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
