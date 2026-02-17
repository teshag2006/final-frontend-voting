/**
 * FRAUD MONITORING - API INTEGRATION EXAMPLES
 * 
 * Copy-paste ready examples for connecting to backend APIs.
 * Replace mock data calls with these when backend is ready.
 */

// ============================================================================
// 1. Fetch Fraud Summary Metrics
// ============================================================================

export async function fetchFraudSummary() {
  try {
    const response = await fetch('/api/admin/fraud/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch fraud summary');

    return await response.json();
  } catch (error) {
    console.error('[Fraud Monitoring] Summary fetch error:', error);
    throw error;
  }
}

// ============================================================================
// 2. Fetch Fraud Cases (with filtering, sorting, pagination)
// ============================================================================

interface FraudCasesQueryParams {
  riskLevel?: string;
  status?: string;
  type?: string;
  event?: string;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  deviceId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function fetchFraudCases(params: FraudCasesQueryParams) {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`/api/admin/fraud/cases?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch fraud cases');

    return await response.json();
  } catch (error) {
    console.error('[Fraud Monitoring] Cases fetch error:', error);
    throw error;
  }
}

// ============================================================================
// 3. Fetch Single Fraud Case Details
// ============================================================================

export async function fetchFraudCaseDetails(caseId: string) {
  try {
    const response = await fetch(`/api/admin/fraud/cases/${caseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch case details');

    return await response.json();
  } catch (error) {
    console.error('[Fraud Monitoring] Case details fetch error:', error);
    throw error;
  }
}

// ============================================================================
// 4. Mark Case as Reviewed
// ============================================================================

interface MarkReviewedRequest {
  caseId: string;
  notes: string;
  adminId: string;
}

export async function markCaseAsReviewed({ caseId, notes, adminId }: MarkReviewedRequest) {
  try {
    const response = await fetch(`/api/admin/fraud/cases/${caseId}/mark-reviewed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes,
        adminId,
      }),
    });

    if (!response.ok) throw new Error('Failed to mark case as reviewed');

    const result = await response.json();
    console.log('[Fraud Monitoring] Case marked as reviewed', result);
    return result;
  } catch (error) {
    console.error('[Fraud Monitoring] Mark reviewed error:', error);
    throw error;
  }
}

// ============================================================================
// 5. Block IP Address
// ============================================================================

interface BlockIPRequest {
  ipAddress: string;
  notes: string;
  adminId: string;
}

export async function blockIP({ ipAddress, notes, adminId }: BlockIPRequest) {
  try {
    const response = await fetch('/api/admin/fraud/blocks/ip', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ipAddress,
        notes,
        adminId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Failed to block IP');

    const result = await response.json();
    console.log('[Fraud Monitoring] IP blocked', result);
    return result;
  } catch (error) {
    console.error('[Fraud Monitoring] Block IP error:', error);
    throw error;
  }
}

// ============================================================================
// 6. Block Device Fingerprint
// ============================================================================

interface BlockDeviceRequest {
  deviceFingerprint: string;
  notes: string;
  adminId: string;
}

export async function blockDevice({ deviceFingerprint, notes, adminId }: BlockDeviceRequest) {
  try {
    const response = await fetch('/api/admin/fraud/blocks/device', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceFingerprint,
        notes,
        adminId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Failed to block device');

    const result = await response.json();
    console.log('[Fraud Monitoring] Device blocked', result);
    return result;
  } catch (error) {
    console.error('[Fraud Monitoring] Block device error:', error);
    throw error;
  }
}

// ============================================================================
// 7. Override Fraud Risk Score
// ============================================================================

interface OverrideRiskRequest {
  caseId: string;
  notes: string;
  reason: string;
  adminId: string;
}

export async function overrideFraudRisk({ caseId, notes, reason, adminId }: OverrideRiskRequest) {
  try {
    const response = await fetch(`/api/admin/fraud/cases/${caseId}/override`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes,
        reason,
        adminId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Failed to override risk');

    const result = await response.json();
    console.log('[Fraud Monitoring] Risk override applied', result);
    return result;
  } catch (error) {
    console.error('[Fraud Monitoring] Override risk error:', error);
    throw error;
  }
}

// ============================================================================
// 8. Escalate Case to Security Team
// ============================================================================

interface EscalateRequest {
  caseId: string;
  notes: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  adminId: string;
}

export async function escalateFraudCase({ caseId, notes, priority, adminId }: EscalateRequest) {
  try {
    const response = await fetch(`/api/admin/fraud/cases/${caseId}/escalate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes,
        priority,
        adminId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Failed to escalate case');

    const result = await response.json();
    console.log('[Fraud Monitoring] Case escalated', result);
    return result;
  } catch (error) {
    console.error('[Fraud Monitoring] Escalate error:', error);
    throw error;
  }
}

// ============================================================================
// 9. Export Fraud Report (CSV)
// ============================================================================

export async function exportFraudReportCSV(filters?: Record<string, any>) {
  try {
    const queryParams = new URLSearchParams(filters || {});

    const response = await fetch(`/api/admin/fraud/export/csv?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
      },
    });

    if (!response.ok) throw new Error('Failed to export CSV');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log('[Fraud Monitoring] Report exported');
  } catch (error) {
    console.error('[Fraud Monitoring] Export CSV error:', error);
    throw error;
  }
}

// ============================================================================
// 10. Fetch Fraud Risk Rules (Display Only)
// ============================================================================

export async function fetchFraudRules() {
  try {
    const response = await fetch('/api/admin/fraud/rules', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch fraud rules');

    return await response.json();
  } catch (error) {
    console.error('[Fraud Monitoring] Rules fetch error:', error);
    throw error;
  }
}

// ============================================================================
// 11. Fetch Fraud Analysis Report
// ============================================================================

interface FraudAnalysisParams {
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchFraudAnalysis(params: FraudAnalysisParams) {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`/api/admin/fraud/analysis?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch fraud analysis');

    return await response.json();
  } catch (error) {
    console.error('[Fraud Monitoring] Analysis fetch error:', error);
    throw error;
  }
}

// ============================================================================
// 12. INTEGRATION TEMPLATE - Replace Mock Data in Page Component
// ============================================================================

/**
 * In app/admin/fraud/page.tsx, replace:
 * 
 *   // Initialize mock data
 *   useEffect(() => {
 *     setTimeout(() => {
 *       const mockCases = generateMockFraudCases(200);
 *       setAllCases(mockCases);
 *       setSummary(calculateFraudSummary(mockCases));
 *       setIsLoading(false);
 *     }, 800);
 *   }, []);
 * 
 * With:
 * 
 *   // Fetch from API
 *   useEffect(() => {
 *     async function loadData() {
 *       try {
 *         const [casesData, summaryData] = await Promise.all([
 *           fetchFraudCases({ page: 1, pageSize: 50 }),
 *           fetchFraudSummary(),
 *         ]);
 *         setAllCases(casesData.cases);
 *         setSummary(summaryData);
 *       } catch (error) {
 *         console.error('Failed to load fraud data:', error);
 *       } finally {
 *         setIsLoading(false);
 *       }
 *     }
 *     loadData();
 *   }, []);
 * 
 * 
 * And replace action handlers:
 * 
 *   const handleActionConfirm = async (notes: string) => {
 *     try {
 *       if (actionModal.action === 'mark_reviewed') {
 *         await markCaseAsReviewed({
 *           caseId: actionModal.targetId!,
 *           notes,
 *           adminId: 'CURRENT_ADMIN_ID', // Get from auth context
 *         });
 *       } else if (actionModal.action === 'block_ip') {
 *         await blockIP({
 *           ipAddress: actionModal.targetId!,
 *           notes,
 *           adminId: 'CURRENT_ADMIN_ID',
 *         });
 *       }
 *       // ... etc for other actions
 *       setActionModal({ isOpen: false });
 *       await handleRefresh(); // Refresh data
 *     } catch (error) {
 *       console.error('Action failed:', error);
 *     }
 *   };
 */

// ============================================================================
// ERROR HANDLING PATTERNS
// ============================================================================

/**
 * Recommended error handling wrapper for all API calls:
 */

export async function handleFraudAPIError(error: any, context: string) {
  if (error.response?.status === 401) {
    // Session expired
    console.error(`[${context}] Unauthorized - redirecting to login`);
    // window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Permission denied
    console.error(`[${context}] Forbidden - insufficient permissions`);
  } else if (error.response?.status === 429) {
    // Rate limited
    console.error(`[${context}] Rate limited - try again later`);
  } else {
    console.error(`[${context}] Error:`, error.message);
  }
}
