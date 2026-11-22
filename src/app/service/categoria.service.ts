import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, delay, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { CATEGORIAS_MOCK } from '../core/mocks/categorias.mock';
import { Categoria } from '../interface/categoria.interface';

const MOCK_DELAY_MS = 300;

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categorias`;

  // TODO backend: GET /api/categorias
  listar(): Observable<Categoria[]> {
    if (!environment.useMock) {
      return this.http.get<Categoria[]>(this.baseUrl);
    }
    return defer(() => of(CATEGORIAS_MOCK.map((c) => ({ ...c })))).pipe(delay(MOCK_DELAY_MS));
  }
}
