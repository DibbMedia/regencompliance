// Mock environment variables for tests. Must satisfy lib/env.ts schema in
// case validateEnv() is ever exercised in a test.
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key"
process.env.STRIPE_SECRET_KEY = "sk_test_fake"
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_fake"
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_fake"
process.env.STRIPE_PRICE_ID = "price_test_fake"
process.env.ANTHROPIC_API_KEY = "test-key"
process.env.CRON_SECRET = "test-cron-secret"
process.env.ADMIN_EMAIL = "test-admin@test.com"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
process.env.NEXT_PUBLIC_APP_NAME = "RegenCompliance"
