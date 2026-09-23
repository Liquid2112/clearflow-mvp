import { getLeads } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }

  // Validate token (simple check matching the format issued by /admin/auth)
  if (!token.startsWith('admin-')) {
    return Response.json({ error: 'Invalid token.' }, { status: 403 });
  }

  try {
    const leads = getLeads();
    return Response.json({ leads });
  } catch (err) {
    console.error('admin/leads error:', err);
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
