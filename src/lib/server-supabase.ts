import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../types/database'

export function createServerClient(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return createServerSupabaseClient<Database>({ req, res })
}