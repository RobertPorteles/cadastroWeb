import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ClienteRequest, ClienteService } from '../../../services/cliente.service';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Component({
  selector: 'app-criar-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './criar-usuario.html',
  styleUrl: './criar-usuario.css'
})
export class CriarUsuario implements OnInit {
  userForm!: FormGroup;
  loadingCepIndex: number | null = null;
  submitted = false;
  isSubmitting = false;
  title = 'Cadastro de Cliente';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nome: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(100), Validators.pattern(/.*\S.*/)]
      ],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      dataNascimento: ['', [Validators.required]],
      enderecos: this.fb.array([this.createEnderecoGroup()])
    });
  }

  get enderecos(): FormArray {
    return this.userForm.get('enderecos') as FormArray;
  }

  enderecoGroup(index: number): FormGroup {
    return this.enderecos.at(index) as FormGroup;
  }

  private createEnderecoGroup(): FormGroup {
    return this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      logradouro: ['', [Validators.required]],
      complemento: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      uf: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]]
    });
  }

  addEndereco(): void {
    this.enderecos.push(this.createEnderecoGroup());
  }

  removeEndereco(index: number): void {
    if (this.enderecos.length > 1) {
      this.enderecos.removeAt(index);
    }
  }

  buscarCep(index: number): void {
    const endereco = this.enderecoGroup(index);
    const cepControl = endereco.get('cep');

    if (!cepControl || cepControl.invalid) {
      cepControl?.markAsTouched();
      return;
    }

    const cep = cepControl.value;
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    this.loadingCepIndex = index;

    this.http
      .get<ViaCepResponse>(url)
      .pipe(finalize(() => (this.loadingCepIndex = null)))
      .subscribe({
        next: (response) => {
          if (response.erro) {
            alert('CEP nao encontrado. Por favor, verifique o numero digitado.');
            this.limparEndereco(index);
            cepControl.setErrors({ cepNaoEncontrado: true });
          } else {
            this.preencherEndereco(index, response);
          }
        },
        error: (err) => {
          console.error('Erro ao buscar o CEP:', err);
          alert('Ocorreu um erro ao consultar o CEP. Tente novamente.');
        }
      });
  }

  private preencherEndereco(index: number, data: ViaCepResponse): void {
    this.enderecoGroup(index).patchValue({
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf?.toUpperCase() ?? ''
    });
  }

  private limparEndereco(index: number): void {
    this.enderecoGroup(index).patchValue({
      logradouro: '',
      bairro: '',
      cidade: '',
      uf: ''
    });
  }

  private buildPayload(): ClienteRequest {
    const value = this.userForm.value;
    return {
      nome: value.nome?.trim() ?? '',
      email: value.email?.trim() ?? '',
      cpf: value.cpf ?? '',
      dataNascimento: value.dataNascimento ?? '',
      enderecos: (value.enderecos ?? []).map((endereco: any) => ({
        logradouro: endereco.logradouro?.trim() ?? '',
        complemento: endereco.complemento?.trim() ?? '',
        numero: endereco.numero?.trim() ?? '',
        bairro: endereco.bairro?.trim() ?? '',
        cidade: endereco.cidade?.trim() ?? '',
        uf: endereco.uf?.toUpperCase() ?? '',
        cep: endereco.cep ?? ''
      }))
    };
  }

  private resetForm(): void {
    this.userForm.reset();
    this.enderecos.clear();
    this.enderecos.push(this.createEnderecoGroup());
    this.submitted = false;
  }

  onSubmit(): void {
    this.submitted = true;
    this.userForm.markAllAsTouched();
    this.enderecos.controls.forEach((control) => (control as FormGroup).markAllAsTouched());

    if (this.userForm.invalid) {
      console.log('Formulario invalido. Verifique os campos.');
      return;
    }

    const payload = this.buildPayload();

    this.isSubmitting = true;

    this.clienteService
      .create(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          console.log('Cliente criado com sucesso!', response);
          alert('Cliente criado com sucesso!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Erro ao salvar cliente:', error);
          alert('Nao foi possivel salvar o cliente. Tente novamente.');
        }
      });
  }
}

