import { redirect } from "react-router";
import { AuthErrorCode } from "./types";

export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function handleAuthError(error: AuthError, request: Request) {
  const url = new URL(request.url);
  const redirectTo = encodeURIComponent(url.pathname);

  switch (error.code) {
    case AuthErrorCode.INVALID_CREDENTIALS:
      return redirect(`/login?error=invalid_credentials&redirectTo=${redirectTo}`);
    
    case AuthErrorCode.SESSION_EXPIRED:
    case AuthErrorCode.INVALID_SESSION:
      return redirect(`/login?error=session_expired&redirectTo=${redirectTo}`);
    
    case AuthErrorCode.NO_ORGANIZATION:
      return redirect("/organizations/new");
    
    case AuthErrorCode.NO_CONNECTION:
      return redirect("/connections/new");
    
    case AuthErrorCode.MISSING_PERMISSIONS:
      return redirect("/?error=insufficient_permissions");
    
    default:
      return redirect(`/login?error=unknown&redirectTo=${redirectTo}`);
  }
}
