import { Routes } from '@angular/router';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { AutenticarUsuario } from './components/pages/autenticar-usuario/autenticar-usuario';
// CORREÇÃO: Importando a classe 'CriarUsuario' com o nome correto.
import { CriarUsuario } from './components/pages/criar-usuario/criar-usuario';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
{
    path: 'pages/dashboard',
    component: Dashboard,
    canActivate: [authGuard]
},
{
    path:'pages/autenticar',
    component: AutenticarUsuario,
    canActivate: [authGuard]
},
{
    // CORREÇÃO: O componente para esta rota é 'CriarUsuario'
    path:'pages/cadastrar-usuario',
    component: CriarUsuario,
    canActivate: [authGuard]
},
{
    path: '',
    pathMatch: 'full',
    redirectTo: 'pages/autenticar'
}
];

