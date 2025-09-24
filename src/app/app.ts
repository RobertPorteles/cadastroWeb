import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CriarUsuario } from './components/pages/criar-usuario/criar-usuario';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CriarUsuario],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cadastroWeb');
}
