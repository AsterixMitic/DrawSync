import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorPayload = {
        url: req.url,
        status: error.status,
        message: error.message,
      };

      console.error('HTTP request failed', errorPayload);
      return throwError(() => error);
    })
  );
};
