import { Algorithm } from '@levminer/speakeasy';
import { FastifyPluginCallback } from 'fastify';

interface PluginOptions {
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
}
declare const _default: FastifyPluginCallback<PluginOptions>;

export { _default as default };
