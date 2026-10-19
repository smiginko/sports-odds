import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { TabBar } from './layout/tab-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, TabBar],
  templateUrl: './app.html',
  // Full-height column so the footer sits at the bottom; on phones room for the fixed tab bar.
  host: { class: 'flex min-h-dvh flex-col pb-16 sm:pb-0' },
})
export class App {}
