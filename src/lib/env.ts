const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
] as const

type RequiredEnvVar = typeof requiredEnvVars[number]

type EnvConfig = Record<RequiredEnvVar, string> & {
  NEXT_PUBLIC_ENV: string
  isProduction: boolean
  isDevelopment: boolean
  isTest: boolean
}

function validateEnv(): EnvConfig {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  )

  if (missingVars.length > 0) {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      console.warn(
        'Missing required environment variables:',
        missingVars.join(', ')
      )
    } else {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      )
    }
  }

  const config = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  } as EnvConfig

  if (config.isDevelopment) {
    console.log('Environment configuration:', {
      api: config.NEXT_PUBLIC_API_URL ? 'configured' : 'missing',
      app: config.NEXT_PUBLIC_APP_URL ? 'configured' : 'missing',
      mode: config.NEXT_PUBLIC_ENV,
    })
  }

  return config
}

export const env = validateEnv()

export function getEnvVar(name: string): string | undefined {
  return process.env[name]
}

export function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required environment variable ${name} is not defined`)
  }
  return value
}
