export interface JwtPayload {
  sub: string;      
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}