import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 401) {
    return 'Problém s API kľúčom: chýba, je neplatný alebo vyčerpal limit. Postup nájdeš v README.';
  }
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return 'Zápas alebo súťaž sa nenašli. Zápas už mohol skončiť.';
  }
  return 'Server neodpovedá alebo si offline. Skús to o chvíľu znova.';
}
