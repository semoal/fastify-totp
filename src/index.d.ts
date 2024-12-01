import { FastifyPluginCallback } from 'fastify';
import { TotpVerifyOptions, Algorithm, GeneratedSecret, TotpOptions, OtpauthURLOptions } from '@levminer/speakeasy';

declare module "fastify" {
    interface FastifyInstance {
        totp: totp.TOTP;
    }

    interface FastifyRequest {
        totpVerify(options?: TotpVerifyOptions): void;
    }
}

type TotpPlugin = FastifyPluginCallback<totp.TOTP["options"]>;

declare namespace totp {
    export interface TOTP {
        options: {
            /** The length of the generated secret. Default: 20 */
            secretLength?: number;
            /** The label to show in third-party authenticators. Usually the app name. Default: "Fastify" */
            totpLabel?: string;
            /** The allowable previous or future "time-windows" to check against of. Default: 1  */
            totpWindow?: number;
            /** The algorithm to use for hash generation. Default: "sha512"  */
            totpAlg?: Algorithm;
            /** Time step in seconds. Default: 30 */
            totpStep?: number;
        };

        /** Generate a new secret with the provided length (or use default one otherwise)    */
        generateSecret(length?: number): GeneratedSecret;
        /** Generate a TOTP token based on given options. **/
        generateToken(options: TotpOptions): string | null;
        /** Generate an auth URL* that can be used to configure a third-party authenticator. */
        generateAuthURL(options: OtpauthURLOptions): string | null;
        /** Genereate a data-URI of a QRCode to share the auth URL. */
        generateQRCode(options: OtpauthURLOptions): Promise<string | null>;
        /** Verify a TOTP token with the original secret. */
        verify(options: TotpVerifyOptions): boolean;
    }

    export const totpPlugin: TotpPlugin;
    export { totpPlugin as default };
}

declare function totpPlugin(
    ...params: Parameters<TotpPlugin>
): ReturnType<TotpPlugin>;

export { totpPlugin as default };
