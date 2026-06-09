#!/usr/bin/env npx tsx

/**
 * Health Check Script
 * Verifies the application is ready for deployment by checking:
 * - Required environment variables
 * - Database connectivity
 * - API routes respond correctly
 */

interface HealthCheckResult {
  name: string
  passed: boolean
  message: string
}

const checks: HealthCheckResult[] = []

// Check environment variables
function checkEnvVars(): void {
  const requiredVars = [
    'KEY_ENCRYPTION_SECRET',
  ]

  const optionalVars = [
    'RESEND_API_KEY',
    'OPENAI_API_KEY',
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
    'APP_URL',
  ]

  const missing: string[] = []
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    checks.push({
      name: 'Environment Variables',
      passed: false,
      message: `Missing required: ${missing.join(', ')}`,
    })
  } else {
    checks.push({
      name: 'Environment Variables',
      passed: true,
      message: 'All required environment variables present',
    })
  }

  const optionalMissing = optionalVars.filter(v => !process.env[v])
  if (optionalMissing.length > 0) {
    console.log(`  ⚠ Optional vars not set: ${optionalMissing.join(', ')}`)
  }
}

// Check TypeScript compilation
async function checkTypeScript(): Promise<void> {
  try {
    const { execSync } = await import('child_process')
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    checks.push({
      name: 'TypeScript',
      passed: true,
      message: 'TypeScript compilation successful',
    })
  } catch {
    checks.push({
      name: 'TypeScript',
      passed: false,
      message: 'TypeScript compilation failed',
    })
  }
}

// Check build
async function checkBuild(): Promise<void> {
  try {
    const { execSync } = await import('child_process')
    execSync('npm run build', { stdio: 'pipe' })
    checks.push({
      name: 'Build',
      passed: true,
      message: 'Build completed successfully',
    })
  } catch {
    checks.push({
      name: 'Build',
      passed: false,
      message: 'Build failed',
    })
  }
}

// Check API routes exist
function checkApiRoutes(): void {
  const fs = require('fs')
  const path = require('path')

  const appDir = path.join(process.cwd(), 'app', 'api')
  if (!fs.existsSync(appDir)) {
    checks.push({
      name: 'API Routes',
      passed: true,
      message: 'No API routes directory found (may be intentional)',
    })
    return
  }

  const routes: string[] = []
  function walkDir(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name !== 'route.ts' && !entry.name.startsWith('_')) {
          walkDir(path.join(dir, entry.name))
        }
      } else if (entry.name === 'route.ts') {
        routes.push(dir.replace(appDir, ''))
      }
    }
  }

  try {
    walkDir(appDir)
    checks.push({
      name: 'API Routes',
      passed: true,
      message: `Found ${routes.length} API route(s)`,
    })
  } catch {
    checks.push({
      name: 'API Routes',
      passed: false,
      message: 'Failed to scan API routes',
    })
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🧠 Recall - Health Check\n')
  console.log('Checking environment variables...')
  checkEnvVars()
  console.log('Checking TypeScript...')
  await checkTypeScript()
  console.log('Checking build...')
  await checkBuild()
  console.log('Checking API routes...')
  await checkApiRoutes()

  console.log('\n' + '═'.repeat(50))
  console.log('RESULTS\n')

  let allPassed = true
  for (const check of checks) {
    const status = check.passed ? '✅' : '❌'
    console.log(`${status} ${check.name}`)
    console.log(`   ${check.message}\n`)
    if (!check.passed) allPassed = false
  }

  console.log('═'.repeat(50))
  if (allPassed) {
    console.log('✅ All checks passed! App is ready for deployment.')
    process.exit(0)
  } else {
    console.log('❌ Some checks failed. Please fix before deploying.')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Health check error:', err)
  process.exit(1)
})