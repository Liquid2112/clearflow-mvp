import { createUserCheck, getUserCheck } from '@/lib/db';
import { geocodeAddress, matchWaterSystem } from '@/lib/geo';
import { fetchComplianceData } from '@/lib/epa';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, zip } = body;

    // Allow ZIP-only lookup
    const hasAddress = address && typeof address === 'string' && address.trim().length > 0;
    const hasZip = zip && typeof zip === 'string' && zip.trim().length > 0;

    if (!hasAddress && !hasZip) {
      return Response.json(
        { error: 'Please enter an address or ZIP code.' },
        { status: 400 }
      );
    }

    // Resolve location from address or ZIP
    const geo = hasAddress ? geocodeAddress(address.trim()) : geocodeAddress(zip.trim());
    let pwsid: string | null = null;
    let waterSystem = null;

    if (geo && geo.lat !== null && geo.lng !== null) {
      waterSystem = matchWaterSystem(geo.lat, geo.lng);
      if (waterSystem) {
        pwsid = waterSystem.pwsid;
      }
    }

    // Create check record
    const check = createUserCheck({
      address: hasAddress ? address.trim() : `ZIP:${zip.trim()}`,
      zip: zip || null,
      latitude: geo?.lat ?? 0,
      longitude: geo?.lng ?? null,
      pwsid: pwsid,
      matchConfidence: waterSystem?.match_confidence ?? 'Low',
      boundarySource: waterSystem?.boundary_source ?? null,
      waterSystem: waterSystem,
    });

    return Response.json({
      checkId: check.id,
      addressHash: check.addressHash,
      zip: check.zip,
      latitude: check.latitude,
      longitude: check.longitude,
      pwsid: check.pwsid,
      matchConfidence: check.matchConfidence,
      boundarySource: check.boundarySource,
      waterSystem: check.waterSystem,
    });
  } catch (err) {
    console.error('check-water error:', err);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
