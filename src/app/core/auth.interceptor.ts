import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "./auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const ehLogin = req.url.startsWith("/api/auth/login");
  const token = auth.token();

  const requisicao =
    token && req.url.startsWith("/api") && !ehLogin
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(requisicao).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401 && !ehLogin) {
        auth.logout();
      }
      return throwError(() => erro);
    }),
  );
};
