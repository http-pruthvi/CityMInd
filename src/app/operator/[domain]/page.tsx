import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  DOMAIN_CONFIGS, 
  MOCK_METRICS, 
  MOCK_TIMESERIES, 
  MOCK_GEO_MARKERS, 
  MOCK_ALERTS 
} from '@/lib/mock/data';
import type { DomainId } from '@/types';

const CityMap = dynamic(() => import('@/components/maps/CityMap'), { ssr: false });
const DomainChart = dynamic(() => import('@/components/charts/DomainChart'), { ssr: false });

interface DomainPageProps {
  params: Promise<{ domain: string }>;
}

export default async function DomainDetailPage({ params }: DomainPageProps) {
  const { domain } = await params;
  const domainId = domain as DomainId;

  const domainConfig = DOMAIN_CONFIGS.find((d) => d.id === domainId);
  if (!domainConfig) {
    notFound();
    return null;
  }

  // Get domain specific datasets
  const metrics = MOCK_METRICS[domainId] || [];
  const timeSeries = MOCK_TIMESERIES[domainId] || [];
  const mapMarkers = MOCK_GEO_MARKERS[domainId] || [];
  const alerts = MOCK_ALERTS.filter((a) => a.domain === domainId && a.status !== 'resolved');

  // Hardcoded but highly realistic AI insights per domain to show AI decision intelligence
  const aiInsights = getAiInsightsForDomain(domainId);

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ backgroundColor: `${domainConfig.color}15`, color: domainConfig.color }}
        >
          <span className="text-xl font-bold uppercase">{domainConfig.id.slice(0,2)}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold">{domainConfig.name} Insights</h1>
          <p className="text-xs text-gray-400">{domainConfig.description}</p>
        </div>
      </div>

      {/* Domain Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.metricId || metric.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{(metric.metricId || metric.id || '').replace(/([A-Z])/g, ' $1')}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                metric.trend === 'up' && domainConfig.id !== 'safety' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {metric.changePercent}%
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold font-mono tracking-tight">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Decision Intelligence Insights */}
      <div className="bg-gradient-to-r from-cyan-950/10 to-indigo-950/10 border border-cyan-500/10 rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Gemini Decision Intelligence
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-white/[0.01] border border-white/[0.04]">
              <h4 className="text-xs font-bold text-gray-300">{insight.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden h-[360px] flex flex-col">
          <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">{domainConfig.name} Node Layer Map</h2>
          </div>
          <div className="flex-1 min-h-0 relative">
            <CityMap markers={mapMarkers} height="100%" />
          </div>
        </div>

        {/* Alerts queue for domain */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col h-[360px] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Department Tickets</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-white/[0.02] transition space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    alert.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{alert.status}</span>
                </div>
                <h3 className="text-xs font-bold">{alert.title}</h3>
                <p className="text-[11px] text-gray-400">{alert.description}</p>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-16 text-xs text-gray-500">No active tickets for this department.</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {timeSeries.map((ts, idx) => (
          <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <DomainChart 
              type={idx % 2 === 0 ? 'line' : 'area'} 
              data={ts.points as any} 
              title={ts.name} 
              color={domainConfig.color} 
              height={220} 
            />
          </div>
        ))}
      </div>

    </div>
  );
}

function getAiInsightsForDomain(domain: DomainId) {
  switch (domain) {
    case 'mobility':
      return [
        { title: 'Signal Duration Calibration Recommended', text: 'Adaptive signal systems predict an increase in evening commute delays by 18% along Sector 4 arterial road. Adjusting green cycles by +15s can mitigate this bottle-neck.' },
        { title: 'Public Transit Rerouting Analysis', text: 'Construction on Bypass St. has increased Route 14 delays. AI recommends active dynamic bus lanes and dispatching an extra shuttle unit between 5:30 PM - 7:00 PM.' }
      ];
    case 'safety':
      return [
        { title: 'Localized Incident Pattern Clustering', text: 'Crowd analytics detects minor incident clustering near Central Square on Friday nights. Dispatching smart patrol units pre-emptively at 10 PM is recommended.' },
        { title: 'Response SLA Achievement', text: 'Average police dispatch delay has dropped to 4.2m, matching target SLA. System is maintaining high operational efficiency.' }
      ];
    case 'environment':
      return [
        { title: 'Industrial Pollutant Drift Prediction', text: 'PM2.5 levels near Sensor #21 are trending towards 160 µg/m³ due to changing wind patterns. Issuing localized alerts to primary schools is advised.' },
        { title: 'IoT Grid Telemetry Consistency', text: 'Sensor drift check shows high telemetry alignment (99.2% confidence). Calibration cycle schedule remains active.' }
      ];
    default:
      return [
        { title: 'KPI Trend Evaluation', text: 'Primary KPIs reflect stable operating ranges. No immediate anomalies detected by the anomaly filter agent.' },
        { title: 'Automation Opportunities', text: '311 ticket volume shows consistent patterns. Consider enabling auto-draft responses for common queries.' }
      ];
  }
}
