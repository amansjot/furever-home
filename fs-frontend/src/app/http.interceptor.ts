import { HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { LoginService } from "./services/login.service";
import { inject } from "@angular/core";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Inject the current `LoginService` and use it to get an authentication token:
  const authToken = inject(LoginService).token;
  console.log('HTTP Interceptor - Request URL:', req.url);
  console.log('HTTP Interceptor - Token exists:', authToken.length > 0);

  // Clone the request to add the authentication header with the `Bearer` prefix.
  if (authToken.length > 0) {
    const newReq = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${authToken}`), // Add "Bearer" prefix
    });
    console.log('HTTP Interceptor - Added Authorization header');
    return next(newReq);
  } else {
    console.log('HTTP Interceptor - No token available, sending request without Authorization header');
    return next(req);
  }
}
