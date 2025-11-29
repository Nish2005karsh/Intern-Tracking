export type Roles = 'admin' | 'mentor' | 'student';
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
