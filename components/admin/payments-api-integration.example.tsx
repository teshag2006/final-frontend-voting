/**
 * ADMIN PAYMENTS - API INTEGRATION EXAMPLES
 * 
 * This file provides complete copy-paste ready examples for replacing mock data
 * with actual API calls. Uncomment and adapt as needed.
 */

/**
 * EXAMPLE 1: Fetch Payments List with Filters
 * Replace: generateMockPayments(386)
 */
export async function fetchPaymentsList(filters: {
  status?: string;
  eventId?: string;
  gateway?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  fraudRisk?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.eventId) params.append('eventId', filters.eventId);
    if (filters.gateway) params.append('gateway', filters.gateway);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.minAmount) params.append('minAmount', String(filters.minAmount));
    if (filters.maxAmount) params.append('maxAmount', String(filters.maxAmount));
    if (filters.fraudRisk) params.append('fraudRisk', filters.fraudRisk);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit || 50));

    const response = await fetch(`/api/admin/payments?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return data.payments; // Array of PaymentData
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    throw error;
  }
}

/**
 * EXAMPLE 2: Fetch Payment Summary
 * Replace: calculatePaymentsSummary(payments)
 */
export async function fetchPaymentsSummary() {
  try {
    const response = await fetch('/api/admin/payments/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return {
      totalPaymentsToday: data.totalPaymentsToday,
      completedPayments: data.completedPayments,
      pendingPayments: data.pendingPayments,
      failedPayments: data.failedPayments,
      refundedAmount: data.refundedAmount,
      totalRevenue: data.totalRevenue,
    };
  } catch (error) {
    console.error('Failed to fetch summary:', error);
    throw error;
  }
}

/**
 * EXAMPLE 3: Get Payment Details
 * Call when user clicks "View Details"
 */
export async function fetchPaymentDetails(paymentId: string) {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return {
      payment: data.payment,
      linkedVotes: data.linkedVotes,
      gatewayResponse: data.gatewayResponse,
      fraudScore: data.fraudScore,
      deviceFingerprint: data.deviceFingerprint,
      blockchainHash: data.blockchainHash,
      blockchainTimestamp: data.blockchainTimestamp,
    };
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw error;
  }
}

/**
 * EXAMPLE 4: Verify Pending Payment
 * Call when user clicks "Verify" on PENDING payment
 */
export async function verifyPayment(paymentId: string) {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}/verify`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminId: getUserId(), // Get current admin ID
        verifiedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return data.payment;
  } catch (error) {
    console.error('Failed to verify payment:', error);
    throw error;
  }
}

/**
 * EXAMPLE 5: Refund Payment
 * Call when user confirms refund in modal
 */
export async function refundPayment(paymentId: string, reason: string) {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason,
        adminId: getUserId(),
        reversedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return data.refund; // Refund transaction details
  } catch (error) {
    console.error('Failed to refund payment:', error);
    throw error;
  }
}

/**
 * EXAMPLE 6: Flag Payment as Suspicious
 * Call when user clicks "Flag as Suspicious"
 */
export async function flagPaymentSuspicious(paymentId: string) {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}/flag`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'FLAGGED',
        adminId: getUserId(),
        flaggedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return data.payment;
  } catch (error) {
    console.error('Failed to flag payment:', error);
    throw error;
  }
}

/**
 * EXAMPLE 7: Fetch Gateway Logs
 * Call when user clicks "View Gateway Log"
 */
export async function fetchGatewayLogs(paymentId: string) {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}/gateway-logs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return {
      gatewayName: data.gatewayName,
      transactionId: data.transactionId,
      logs: data.logs, // Array of log entries
      webhookEvents: data.webhookEvents,
      lastSyncedAt: data.lastSyncedAt,
    };
  } catch (error) {
    console.error('Failed to fetch gateway logs:', error);
    throw error;
  }
}

/**
 * EXAMPLE 8: Export Payments - CSV
 * Call when user clicks "Export CSV"
 */
export async function exportPaymentsCSV(filters: {
  status?: string;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    const params = new URLSearchParams({
      format: 'csv',
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    });

    const response = await fetch(`/api/admin/payments/export?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const blob = await response.blob();
    downloadBlob(blob, `payments_${Date.now()}.csv`);
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw error;
  }
}

/**
 * EXAMPLE 9: Export Payments - Excel
 * Call when user clicks "Export Excel"
 */
export async function exportPaymentsExcel(filters: {
  status?: string;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    const params = new URLSearchParams({
      format: 'xlsx',
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    });

    const response = await fetch(`/api/admin/payments/export?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const blob = await response.blob();
    downloadBlob(blob, `payments_${Date.now()}.xlsx`);
  } catch (error) {
    console.error('Failed to export Excel:', error);
    throw error;
  }
}

/**
 * EXAMPLE 10: Export Payments - PDF
 * Call when user clicks "Export PDF"
 */
export async function exportPaymentsPDF(filters: {
  status?: string;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    const params = new URLSearchParams({
      format: 'pdf',
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    });

    const response = await fetch(`/api/admin/payments/export?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const blob = await response.blob();
    downloadBlob(blob, `payments_${Date.now()}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

/**
 * EXAMPLE 11: Fetch Fraud Analysis
 * For additional fraud detection insights
 */
export async function fetchFraudAnalysis(paymentId: string) {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}/fraud-analysis`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return {
      fraudScore: data.fraudScore,
      riskFactors: data.riskFactors,
      ipBlacklist: data.ipBlacklist,
      deviceDuplication: data.deviceDuplication,
      rapidTransactionDetection: data.rapidTransactionDetection,
      recommendation: data.recommendation,
    };
  } catch (error) {
    console.error('Failed to fetch fraud analysis:', error);
    throw error;
  }
}

/**
 * EXAMPLE 12: Fetch Event Options for Filter
 * Called on page load to populate event dropdown
 */
export async function fetchEventOptions() {
  try {
    const response = await fetch('/api/admin/events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return data.events.map((e: any) => ({ id: e.id, name: e.name }));
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getUserId(): string {
  // Implement based on your auth system
  return localStorage.getItem('userId') || '';
}

/**
 * INTEGRATION IN PAGE.TSX:
 * 
 * Replace in useEffect:
 * 
 * useEffect(() => {
 *   (async () => {
 *     try {
 *       const payments = await fetchPaymentsList({page: 1, limit: 50});
 *       setAllPayments(payments);
 *       
 *       const summary = await fetchPaymentsSummary();
 *       setSummary(summary);
 *       
 *       setIsLoading(false);
 *     } catch (error) {
 *       console.error('Failed to load payments:', error);
 *       // Show error toast
 *     }
 *   })();
 * }, []);
 * 
 * Replace in handleConfirmRefund:
 * 
 * const refund = await refundPayment(refundModal.payment!.id, 'Admin refund');
 * 
 * Replace in handleViewLog:
 * 
 * const logs = await fetchGatewayLogs(payment.paymentId);
 * // Display in modal
 */
