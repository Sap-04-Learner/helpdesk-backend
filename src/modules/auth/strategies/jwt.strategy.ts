import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Must match the secret used when signing tokens in AuthModule.
      secretOrKey: process.env.JWT_SECRET || 'company-auth-for-jwt',
    });
  }

  // This payload is exactly what we signed in auth.service.ts
  async validate(payload: any) {
    // We attach this object to the request (req.user)
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
