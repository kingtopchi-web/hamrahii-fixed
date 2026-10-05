import React, { useState, useEffect } from 'react';
import { 
  Server,
  Database,
  Cpu,
  HardDrive,
  Activity,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock as ClockIcon,
  Globe,
  Settings,
  Smartphone,
  Monitor,
  Terminal,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Axios from '../../services/axios';
import { api } from '../../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch platform health data
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(api.admin.platformHealth);
      
      // console.log(response.data, "this is response data");
      
      if (response.data.success) {
        setHealthData(response.data);
        setLastUpdated(new Date(response.data.timestamp).toLocaleString());
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch health data');
      }
    } catch (err) {
      // console.error('Error fetching health data:', err);
      setError(err.message || 'Failed to fetch platform health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    await fetchHealthData();
  };

  const StatCard = ({ title, value, icon: Icon, unit, color = 'blue', onClick, status }) => {
    const statusColors = {
      HEALTHY: 'bg-green-100 text-green-800',
      DEGRADED: 'bg-yellow-100 text-yellow-800',
      DOWN: 'bg-red-100 text-red-800'
    };

    const colorClasses = {
      blue: 'bg-[#EFF6FF] text-[#3B82F6]',
      green: 'bg-[#ECFDF5] text-[#10B981]',
      red: 'bg-[#FEF2F2] text-[#DC2626]',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600',
      gray: 'bg-[#F8FAFC] text-[#475569]'
    };

    return (
      <motion.div
        whileHover={{ y: -5 }}
        onClick={onClick}
        className={`bg-[#FFFFFF] rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0] cursor-pointer transition-all ${
          expandedCard === title ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-[#475569] font-medium truncate">{title}</p>
            <div className="flex items-end gap-1 md:gap-2 mt-1 md:mt-2">
              <span className="text-lg md:text-2xl font-bold text-[#0F172A] truncate">{value}</span>
              {unit && <span className="text-xs md:text-sm text-[#64748B] whitespace-nowrap">{unit}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 md:gap-2 ml-2">
            {status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[status] || 'bg-[#F8FAFC] text-[#0F172A]'}`}>
                {status}
              </span>
            )}
            <div className={`p-2 md:p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const MetricCard = ({ title, value, icon: Icon, subtitle, color = 'gray' }) => {
    const colorClasses = {
      blue: 'bg-[#EFF6FF] text-[#3B82F6]',
      green: 'bg-[#ECFDF5] text-[#10B981]',
      red: 'bg-[#FEF2F2] text-[#DC2626]',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600',
      gray: 'bg-[#F8FAFC] text-[#475569]'
    };

    return (
      <div className="bg-[#FFFFFF] rounded-lg p-3 md:p-4 border border-[#E2E8F0]">
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <div className={`p-1 md:p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <span className="font-medium text-[#0F172A] text-sm md:text-base truncate">{title}</span>
        </div>
        <div className="text-lg md:text-2xl font-bold text-[#0F172A] truncate">{value}</div>
        {subtitle && <div className="text-xs md:text-sm text-[#64748B] mt-1 truncate">{subtitle}</div>}
      </div>
    );
  };

  const StatusIndicator = ({ status, label }) => {
    const statusConfig = {
      UP: { color: 'green', icon: CheckCircle },
      DOWN: { color: 'red', icon: XCircle },
      DEGRADED: { color: 'yellow', icon: AlertTriangle },
      "NOT CONFIGURED": { color: 'gray', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.DOWN;
    const Icon = config.icon;
    const colorClass = `text-${config.color}-500`;

    return (
      <div className="flex items-center gap-1 md:gap-2">
        <Icon className={`w-3 h-3 md:w-4 md:h-4 ${colorClass}`} />
        <span className={`text-xs md:text-sm font-medium ${colorClass.replace('500', '700')} whitespace-nowrap`}>
          {label}
        </span>
      </div>
    );
  };

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0F172A] font-medium text-sm md:text-base">Loading Platform Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-[#FFFFFF] rounded-xl p-6 md:p-8 max-w-md w-full border border-[#FCA5A5]">
          <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-bold text-[#0F172A] mb-2 text-center">Unable to Load Analytics</h3>
          <p className="text-[#475569] text-center mb-6 text-sm md:text-base">{error}</p>
          <button
            onClick={fetchHealthData}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm md:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2E8F0] p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#F8FAFC]"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-bold text-[#0F172A]">Platform Analytics</h1>
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-[#0F172A] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] p-4 overflow-y-auto"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">Platform Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ECFDF5]0"></div>
                  <span className="text-sm">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Degraded</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                  <span className="text-sm">Down</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="p-3 md:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          {!isMobile && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#0F172A]">Platform Analytics</h1>
                    {healthData && (
                      <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${
                        healthData.status === 'HEALTHY' 
                          ? 'bg-green-100 text-green-800' 
                          : healthData.status === 'DEGRADED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {healthData.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[#475569] text-sm md:text-base">Monitor system health and platform performance</p>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={refreshData}
                    disabled={loading}
                    className="p-2 bg-[#FFFFFF] rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-[#0F172A] ${loading ? 'animate-spin' : ''}`} />
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {/* Status Overview */}
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-1 md:gap-2 bg-[#FFFFFF] px-3 py-2 rounded-lg border border-[#CBD5E1] whitespace-nowrap flex-shrink-0">
              <Server className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
              <span className="text-xs md:text-sm font-medium">Env: {healthData?.server?.environment}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 bg-[#FFFFFF] px-3 py-2 rounded-lg border border-[#CBD5E1] whitespace-nowrap flex-shrink-0">
              <ClockIcon className="w-3 h-3 md:w-4 md:h-4 text-[#10B981]" />
              <span className="text-xs md:text-sm font-medium">Uptime: {healthData?.server?.uptime}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 bg-[#FFFFFF] px-3 py-2 rounded-lg border border-[#CBD5E1] whitespace-nowrap flex-shrink-0">
              <Activity className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
              <span className="text-xs md:text-sm font-medium">Resp: {healthData?.api?.responseTime}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 bg-[#FFFFFF] px-3 py-2 rounded-lg border border-[#CBD5E1] whitespace-nowrap flex-shrink-0">
              <Database className="w-3 h-3 md:w-4 md:h-4 text-[#10B981]" />
              <span className="text-xs md:text-sm font-medium">DB: {healthData?.database?.status}</span>
            </div>
          </div>
        </div>

        {/* Platform Health Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <StatCard
            title="Platform Status"
            value={healthData?.status || 'UNKNOWN'}
            icon={ShieldCheck}
            color={healthData?.status === 'HEALTHY' ? 'green' : healthData?.status === 'DEGRADED' ? 'yellow' : 'red'}
            status={healthData?.status}
            onClick={() => setExpandedCard('Platform Status')}
          />
          <StatCard
            title="Database"
            value={healthData?.database?.status || 'DOWN'}
            icon={Database}
            color={healthData?.database?.status === 'UP' ? 'green' : 'red'}
            unit={healthData?.database?.latency}
            onClick={() => setExpandedCard('Database')}
          />
          <StatCard
            title="Memory Usage"
            value={`${healthData?.memory?.node?.heapUsedMB || '0'}`}
            icon={HardDrive}
            color="blue"
            unit="MB Heap Used"
            onClick={() => setExpandedCard('Memory Usage')}
          />
          <StatCard
            title="CPU Usage"
            value={healthData?.server?.cpuUsage || '0%'}
            icon={Cpu}
            color="purple"
            unit=""
            onClick={() => setExpandedCard('CPU Usage')}
          />
        </div>

        {/* System Metrics & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Server Health */}
          <div className="bg-[#FFFFFF] rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-[#0F172A] truncate">Server Health</h3>
                <p className="text-[#475569] text-xs md:text-sm mt-1 truncate">System metrics and performance</p>
              </div>
              <Server className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0 ml-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <MetricCard
                title="Hostname"
                value={healthData?.server?.hostname || 'Unknown'}
                icon={Globe}
                color="blue"
              />
              <MetricCard
                title="Environment"
                value={healthData?.server?.environment || 'Unknown'}
                icon={Settings}
                color="green"
              />
              <MetricCard
                title="CPU Cores"
                value={healthData?.server?.cpuCores || 'Unknown'}
                icon={Cpu}
                color="purple"
                subtitle="Total cores"
              />
              <MetricCard
                title="Platform"
                value={healthData?.server?.platform || 'Unknown'}
                icon={Smartphone}
                color="yellow"
              />
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#E2E8F0]">
              <h4 className="font-medium text-[#0F172A] mb-3 md:mb-4 text-sm md:text-base">System Memory</h4>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-center p-2 md:p-3 border border-[#E2E8F0] rounded-lg">
                  <div className="text-base md:text-lg font-bold text-[#0F172A]">{healthData?.memory?.system?.totalMB || '0'}</div>
                  <div className="text-xs md:text-sm text-[#64748B]">Total System (MB)</div>
                </div>
                <div className="text-center p-2 md:p-3 border border-[#E2E8F0] rounded-lg">
                  <div className="text-base md:text-lg font-bold text-[#0F172A]">{healthData?.memory?.system?.freeMB || '0'}</div>
                  <div className="text-xs md:text-sm text-[#64748B]">Free System (MB)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-[#FFFFFF] rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-[#0F172A] truncate">Database Status</h3>
                <p className="text-[#475569] text-xs md:text-sm mt-1 truncate">MongoDB connection and performance</p>
              </div>
              <Database className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] flex-shrink-0 ml-2" />
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-3 md:p-4 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="p-1 md:p-2 rounded-lg bg-[#EFF6FF] flex-shrink-0">
                    <Database className="w-4 h-4 md:w-5 md:h-5 text-[#3B82F6]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F172A] text-sm md:text-base truncate">Type</p>
                    <p className="text-xs md:text-sm text-[#475569] truncate">Database system</p>
                  </div>
                </div>
                <span className="text-base md:text-lg font-bold text-[#0F172A] whitespace-nowrap ml-2">
                  {healthData?.database?.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 md:p-4 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="p-1 md:p-2 rounded-lg bg-[#ECFDF5] flex-shrink-0">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-[#10B981]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F172A] text-sm md:text-base truncate">Status</p>
                    <p className="text-xs md:text-sm text-[#475569] truncate">Connection status</p>
                  </div>
                </div>
                <div className="ml-2">
                  <StatusIndicator status={healthData?.database?.status} label={healthData?.database?.status} />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 md:p-4 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="p-1 md:p-2 rounded-lg bg-purple-50 flex-shrink-0">
                    <ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F172A] text-sm md:text-base truncate">Latency</p>
                    <p className="text-xs md:text-sm text-[#475569] truncate">Response time</p>
                  </div>
                </div>
                <span className="text-base md:text-lg font-bold text-[#0F172A] whitespace-nowrap ml-2">
                  {healthData?.database?.latency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* API Performance & System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* API Performance */}
          <div className="bg-[#FFFFFF] rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-[#0F172A] truncate">API Performance</h3>
                <p className="text-[#475569] text-xs md:text-sm mt-1 truncate">Response times and latency</p>
              </div>
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-purple-500 flex-shrink-0 ml-2" />
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <span className="font-medium text-[#0F172A] text-sm md:text-base">Response Time</span>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Activity className="w-3 h-3 md:w-4 md:h-4 text-[#10B981]" />
                    <span className="text-xs md:text-sm text-[#475569]">Current</span>
                  </div>
                </div>
                <div className="flex items-end gap-1 md:gap-2">
                  <span className="text-xl md:text-3xl font-bold text-[#0F172A]">
                    {healthData?.api?.responseTime?.split(' ')[0] || '0'}
                  </span>
                  <span className="text-[#64748B] text-sm md:text-base mb-0.5 md:mb-1">
                    {healthData?.api?.responseTime?.split(' ')[1] || 'ms'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-[#F8FAFC] rounded-lg">
                  <p className="text-xs md:text-sm text-[#475569] mb-1">Health Check</p>
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      healthData?.status === 'HEALTHY' ? 'bg-[#ECFDF5]0' : 
                      healthData?.status === 'DEGRADED' ? 'bg-yellow-500' : 'bg-[#EF4444]'
                    }`} />
                    <span className="font-medium text-[#0F172A] text-sm md:text-base">{healthData?.status || 'UNKNOWN'}</span>
                  </div>
                </div>
                
                <div className="p-3 md:p-4 bg-[#F8FAFC] rounded-lg">
                  <p className="text-xs md:text-sm text-[#475569] mb-1">Timestamp</p>
                  <span className="font-medium text-[#0F172A] text-sm md:text-base">
                    {new Date(healthData?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Status Monitor */}
          <div className="bg-[#FFFFFF] rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-[#0F172A] truncate">Service Status</h3>
                <p className="text-[#475569] text-xs md:text-sm mt-1 truncate">Real-time service monitoring</p>
              </div>
              <Monitor className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0 ml-2" />
            </div>
            
            <div className="space-y-2 md:space-y-3">
              {healthData?.services && Object.entries(healthData.services).map(([service, status]) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between p-2 md:p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`p-1 md:p-2 rounded-lg flex-shrink-0 ${
                      status === 'UP' ? 'bg-[#ECFDF5]' : 
                      status === 'NOT CONFIGURED' ? 'bg-[#F8FAFC]' : 'bg-[#FEF2F2]'
                    }`}>
                      {service === 'database' && <Database className="w-3 h-3 md:w-4 md:h-4 text-[#475569]" />}
                      {service === 'apiGateway' && <Server className="w-3 h-3 md:w-4 md:h-4 text-[#475569]" />}
                      {service === 'webServer' && <Globe className="w-3 h-3 md:w-4 md:h-4 text-[#475569]" />}
                      {service === 'cacheService' && <HardDrive className="w-3 h-3 md:w-4 md:h-4 text-[#475569]" />}
                    </div>
                    <span className="font-medium text-[#0F172A] text-sm md:text-base truncate capitalize">
                      {service.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="ml-2">
                    <StatusIndicator status={status} label={status} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 md:mt-8 text-center text-[#64748B] text-xs md:text-sm">
          <p className="px-2">Platform health monitoring updated every 30 seconds. Response times may vary.</p>
          <p className="mt-1 px-2">Last updated: {lastUpdated || 'Never'}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-3 md:mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#ECFDF5]0"></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
              <span>Down</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#F8FAFC]0"></div>
              <span>Not Configured</span>
            </div>
          </div>
        </div>

        {/* Expanded Card View */}
        <AnimatePresence>
          {expandedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4"
              onClick={() => setExpandedCard(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FFFFFF] rounded-xl p-4 md:p-6 w-full max-w-lg max-h-[80vh] md:max-h-[90vh] overflow-y-auto mx-2 md:mx-4"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-[#0F172A] truncate">{expandedCard} Details</h3>
                  <button
                    onClick={() => setExpandedCard(null)}
                    className="p-1 md:p-2 hover:bg-[#F8FAFC] rounded-full flex-shrink-0 ml-2"
                  >
                    <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-[#F8FAFC] p-3 md:p-4 rounded-lg">
                    <h4 className="font-medium text-[#0F172A] mb-2 text-sm md:text-base">Raw Data</h4>
                    <pre className="text-xs text-[#475569] overflow-x-auto max-h-60 md:max-h-96">
                      {JSON.stringify(healthData, null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add scrollbar hide utility to CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Analytics;