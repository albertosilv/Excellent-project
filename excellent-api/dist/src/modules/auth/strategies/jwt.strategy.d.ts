import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: any): Promise<JwtPayload>;
}
export {};
