import fp from 'fastify-plugin'
import speakeasy, { GeneratedSecret, Algorithm } from '@levminer/speakeasy'
import qrcode from 'qrcode'
import { FastifyPluginCallback } from 'fastify'

const DEFAULT_TOTP_SECRET_LENGTH = 20
const DEFAULT_TOTP_LABEL = 'Fastify'
const DEFAULT_TOTP_WINDOW = 1
const DEFAULT_TOTP_ALG = 'sha512'
const DEFAULT_TOTP_STEP = 30

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

const plugin: FastifyPluginCallback<PluginOptions> = function (fastify, opts, next) {
  const TOTP_SECRET_LENGTH = opts.secretLength || DEFAULT_TOTP_SECRET_LENGTH
  const TOTP_LABEL = opts.totpLabel || DEFAULT_TOTP_LABEL
  const TOTP_WINDOW = opts.totpWindow || DEFAULT_TOTP_WINDOW
  const TOTP_ALG: speakeasy.Algorithm = opts.totpAlg || DEFAULT_TOTP_ALG
  const TOTP_STEP = opts.totpStep || DEFAULT_TOTP_STEP

  function generateTOTPSecret(length?: number): GeneratedSecret {
    const secret = speakeasy.generateSecret({
      length: length || TOTP_SECRET_LENGTH
    })
    return secret
  }

  function generateTOTPToken(options: speakeasy.TotpOptions): string | null {
    if (!options) return null;
    if (!options.secret) return null

    const token = speakeasy.totp({
      encoding: options.encoding || 'ascii',
      algorithm: options.algorithm || TOTP_ALG,
      step: options.step || TOTP_STEP,
      ...options
    })

    return token
  }

  function generateAuthURLFromSecret(options: speakeasy.OtpauthURLOptions): string | null {
    if (!options) return null;
    if (!options.secret) return null

    const url = speakeasy.otpauthURL({
      ...options,
      algorithm: options.algorithm || TOTP_ALG,
      label: options.label || TOTP_LABEL,
    })

    return url
  }

  async function generateQRCodeFromSecret(options: speakeasy.OtpauthURLOptions): Promise<string | null> {
    const url = generateAuthURLFromSecret(options)

    if (!url) return null

    return qrcode.toDataURL(url)
  }

  function verifyTOTP(options: speakeasy.TotpVerifyOptions): boolean {
    const result = speakeasy.totp.verifyDelta({
      encoding: options.encoding || 'ascii',
      window: options.window || TOTP_WINDOW,
      step: options.step || TOTP_STEP,
      ...options
    })
    return !!result
  }

  fastify.decorate('totp', {
    generateSecret: generateTOTPSecret,
    generateToken: generateTOTPToken,
    generateAuthURL: generateAuthURLFromSecret,
    generateQRCode: generateQRCodeFromSecret,
    verify: verifyTOTP,
    options: {
      secretLength: TOTP_SECRET_LENGTH,
      totpLabel: TOTP_LABEL,
      totpWindow: TOTP_WINDOW,
      totpAlg: TOTP_ALG,
      totpStep: TOTP_STEP
    }
  })

  fastify.decorateRequest('totpVerify', verifyTOTP)

  next()
}

export default fp(plugin, {
  fastify: '>=5.x',
  name: 'fastify-totp'
})
