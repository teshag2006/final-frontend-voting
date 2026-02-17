'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Zap, Database, Globe } from 'lucide-react';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  timestamp: string;
}

export default function HealthCheckPage() {
  return (
    <ProtectedRouteWrapper requiredRole="admin">
      <HealthCheckContent />
    </ProtectedRouteWrapper>
  );
}

function HealthCheckContent() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      // Mock health check - would call real /health endpoint
      const services: HealthStatus[] = [
        {
          service: 'API Server',
          status: 'healthy',
          responseTime: 45,
          timestamp: new Date().toISOString(),
        },
        {
          service: 'Database',
          status: 'healthy',
          responseTime: 120,
          timestamp: new Date().toISOString(),
        },
        {
          service: 'Redis Cache',
          status: 'healthy',
          responseTime: 8,
          timestamp: new Date().toISOString(),
        },
        {
          service: 'Payment Gateway',
          status: 'healthy',
          responseTime: 250,
          timestamp: new Date().toISOString(),
        },
        {
          service: 'Email Service',
          status: 'degraded',
          responseTime: 1500,
          timestamp: new Date().toISOString(),
        },
      ];

      setHealthStatus(services);
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('[v0] Health check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'down':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-950 text-green-300';
      case 'degraded':
        return 'bg-yellow-950 text-yellow-300';
      case 'down':
        return 'bg-red-950 text-red-300';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const overallStatus =
    healthStatus.length > 0 && healthStatus.every((s) => s.status === 'healthy')
      ? 'healthy'
      : healthStatus.some((s) => s.status === 'down')
      ? 'down'
      : 'degraded';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-slate-400 mt-1">Monitor service health and performance</p>
        </div>
        <button
          onClick={checkHealth}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
          disabled={isLoading}
        >
          {isLoading ? 'Checking...' : 'Check Now'}
        </button>
      </div>

      {/* Overall Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Overall System Status</p>
              <h2 className="text-2xl font-bold mt-1 capitalize">{overallStatus}</h2>
            </div>
            <div className={`px-4 py-2 rounded-full ${getStatusColor(overallStatus)}`}>
              {getStatusIcon(overallStatus)}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Last checked: {new Date(lastUpdate).toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Services */}
      <div className="grid gap-4">
        {healthStatus.map((service) => (
          <Card key={service.service} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{service.service}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(service.status)}`}>
                        {service.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">Response: {service.responseTime}ms</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">{new Date(service.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>

              {service.responseTime > 1000 && (
                <div className="mt-3 p-2 rounded bg-yellow-950 text-yellow-200 text-xs">
                  Slow response time detected ({service.responseTime}ms)
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Average Response Time</p>
              <p className="text-2xl font-bold mt-1">
                {healthStatus.length > 0
                  ? Math.round(healthStatus.reduce((sum, s) => sum + s.responseTime, 0) / healthStatus.length)
                  : 0}
                ms
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Services Healthy</p>
              <p className="text-2xl font-bold mt-1">
                {healthStatus.filter((s) => s.status === 'healthy').length}/{healthStatus.length}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Uptime</p>
              <p className="text-2xl font-bold mt-1">99.9%</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Last Update</p>
              <p className="text-sm mt-1">{new Date(lastUpdate).toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
