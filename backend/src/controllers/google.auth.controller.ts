import { Request, Response } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const FRONTEND_URL = process.env.FRONTEND_URL!

// setup Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const name = profile.displayName
        const googleId = profile.id

        if (!email) {
          return done(new Error('No email from Google'), undefined)
        }

        // check if user already exists with this email
        let user = await prisma.user.findUnique({
          where: { email }
        })

        if (user) {
          // user exists — update googleId if not set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { email },
              data: { googleId }
            })
          }
        } else {
          // new user — create account
          user = await prisma.user.create({
            data: {
              name,
              email,
              googleId,
              role: 'STUDENT'
            }
          })
        }

        return done(null, user)
      } catch (error) {
        return done(error, undefined)
      }
    }
  )
)

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// GET /api/auth/google — redirect to Google
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
})

// GET /api/auth/google/callback — Google redirects here
export const googleCallback = [
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req: Request, res: Response) => {
    const user = req.user as any

    // generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // redirect to frontend with token
    res.redirect(
      `${FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }))}`
    )
  }
]