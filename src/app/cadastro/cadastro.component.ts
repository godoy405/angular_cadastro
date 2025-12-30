import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule} from '@angular/material/card';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cliente} from './cliente';
import { ClienteService } from '../cliente.service';
import { NgxMaskDirective, provideNgxMask} from 'ngx-mask'
import { BrasilapiService } from '../brasilapi.service';
import { Estado, Municipio } from '../brasilapi.models';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-cadastro',
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    NgxMaskDirective,
  ], providers: [
    provideNgxMask()
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent implements OnInit {

  cliente: Cliente = Cliente.newCliente();
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);
  estados: Estado[] = [];
  municipios: Municipio[] = [];

  constructor(
    private service: ClienteService,
    private BrasilapiService: BrasilapiService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
  this.route.queryParamMap.subscribe((query: any) => {
    const params = query['params'];
    const id = params['id'];

    if (id) {
      let clienteEncontrado = this.service.buscarClientePorId(id);

      if (clienteEncontrado) {
        this.atualizando = true;
        this.cliente = clienteEncontrado;

        if (this.cliente.uf) {
          const event = { value: this.cliente.uf };
          this.carregarMunicipios(event as MatSelectChange);
        }
      } else {
        this.cliente = Cliente.newCliente();
      }
    }
  });

  this.carregarUFs();
}

  carregarUFs() {
    //observable  subscriber
    this.BrasilapiService.listarUFs().subscribe({
      next: listaEstados => this.estados = listaEstados,
      error: erro => console.error("erro ao listar estados", erro)
    })
  }

  carregarMunicipios(event: MatSelectChange) { // 👈 CORRIGIDO: MatSelectChange
    const ufSelecionada = event.value;
    this.BrasilapiService.listarMunicipios(ufSelecionada).subscribe({
      next: listaMunicipios => this.municipios = listaMunicipios,
      error: erro => console.error("erro ao listar municipios", erro)
    })
  }

  salvar() {
    if(!this.atualizando){
      this.service.salvar(this.cliente);
      this.cliente = Cliente.newCliente();
      this.mostrarMensagem('Cliente salvo com sucesso!');
    }else{
      this.service.atualizar(this.cliente);
      this.router.navigate(['/consulta']);
      this.mostrarMensagem('Cliente atualizado com sucesso!');
    }
  }

  mostrarMensagem(mensagem: string) {
    this.snack.open(mensagem, 'OK');
  }

}
