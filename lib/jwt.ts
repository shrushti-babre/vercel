const jwt = require("jsonwebtoken")

export function signToken(payload: any, secret: string, options?: any) {
  return jwt.sign(payload, secret, options)
}

export function verifyToken(token: string, secret: string) {
  return jwt.verify(token, secret)
}
