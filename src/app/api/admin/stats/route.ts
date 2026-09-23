import { getStats } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!token.startsWith('admin-')) {
    return Response.json({ error: 'Invalid token.' }, { status: 403 });
  }

  try {
    const stats = getStats();
    return Response.json(stats);
  } catch (err) {
    console.error('admin/stats error:', err);
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
