export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return Response.json(
        { authenticated: false, token: null, error: 'Password required.' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn('ADMIN_PASSWORD env var not set — admin access disabled');
      return Response.json(
        { authenticated: false, token: null, error: 'Admin not configured.' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      // Simple token — in production, use proper session management.
      const token = Buffer.from(`admin-${Date.now()}-${Math.random()}`).toString('base64');
      return Response.json({ authenticated: true, token });
    }

    return Response.json(
      { authenticated: false, token: null, error: 'Incorrect password.' },
      { status: 401 }
    );
  } catch (err) {
    console.error('admin/auth error:', err);
    return Response.json(
      { authenticated: false, token: null, error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
