import { getUserCheck } from '@/lib/db';
import { fetchComplianceData } from '@/lib/epa';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkId = searchParams.get('checkId');

  if (!checkId) {
    return Response.json(
      { error: 'checkId is required.' },
      { status: 400 }
    );
  }

  const check = getUserCheck(checkId);
  if (!check) {
    return Response.json(
      { error: 'Check not found.' },
      { status: 404 }
    );
  }

  // Fetch compliance if we have a PWSID
  let compliance = null;
  let status = 'no_recent_violation';
  let waterSource = null;
  let lastReportDate = null;
  let ccrUrl = null;

  if (check.pwsid) {
    compliance = fetchComplianceData(check.pwsid);
    if (compliance) {
      status = compliance.status;
      waterSource = compliance.waterSource;
      lastReportDate = compliance.lastReportDate;
      ccrUrl = compliance.ccrUrl;
    } else {
      status = 'data_needs_review';
    }
  }

  return Response.json({
    checkId: check.id,
    addressHash: check.addressHash,
    zip: check.zip,
    waterSystem: check.waterSystem,
    matchConfidence: check.matchConfidence,
    boundarySource: check.boundarySource,
    complianceStatus: status,
    compliance: compliance,
    waterSource,
    lastReportDate,
    ccrUrl,
  });
}
