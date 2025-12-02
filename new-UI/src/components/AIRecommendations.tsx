import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function AIRecommendations() {
  const recommendations = [
    {
      type: 'buy',
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      confidence: 85,
      reason: 'Strong momentum in AI sector. Technical indicators show bullish pattern. Analyst upgrades increasing.',
      targetPrice: 525,
      currentPrice: 498.60,
      potentialGain: 5.3,
      timestamp: '2 minutes ago'
    },
    {
      type: 'sell',
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      confidence: 72,
      reason: 'Overbought conditions detected. Resistance at current levels. Consider profit-taking.',
      targetPrice: 355,
      currentPrice: 368.75,
      potentialLoss: -3.7,
      timestamp: '15 minutes ago'
    },
    {
      type: 'hold',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      confidence: 78,
      reason: 'Consolidating after recent gains. Wait for breakout confirmation above $190.',
      targetPrice: 190,
      currentPrice: 185.20,
      potentialGain: 2.6,
      timestamp: '1 hour ago'
    }
  ];

  const marketInsights = [
    { label: 'Market Sentiment', value: 'Bullish', icon: TrendingUp, color: 'text-success' },
    { label: 'Volatility Index', value: 'Moderate', icon: AlertCircle, color: 'text-warning' },
    { label: 'Trade Ideas', value: '3 Active', icon: Sparkles, color: 'text-brand-purple' }
  ];

  return (
    <div className="gradient-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-purple/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-brand-purple" />
        </div>
        <div>
          <h2 className="text-foreground mb-1">AI Recommendations</h2>
          <p className="text-muted-foreground text-sm">Powered by real-time market analysis</p>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {marketInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${insight.color}`} />
                <span className="text-xs text-muted-foreground">{insight.label}</span>
              </div>
              <p className={`text-sm ${insight.color}`}>{insight.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const isPositive = rec.type === 'buy' || (rec.type === 'hold' && rec.potentialGain > 0);
          const bgColor = rec.type === 'buy' ? 'bg-success/10' : rec.type === 'sell' ? 'bg-danger/10' : 'bg-brand-blue/10';
          const borderColor = rec.type === 'buy' ? 'border-success/30' : rec.type === 'sell' ? 'border-danger/30' : 'border-brand-blue/30';
          const textColor = rec.type === 'buy' ? 'text-success' : rec.type === 'sell' ? 'text-danger' : 'text-brand-blue';
          
          return (
            <div key={index} className={`${bgColor} border ${borderColor} rounded-xl p-4 hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${textColor} uppercase text-xs px-2 py-0.5 rounded`} style={{ backgroundColor: `var(--${rec.type === 'buy' ? 'success' : rec.type === 'sell' ? 'danger' : 'brand-blue'})/0.2` }}>
                      {rec.type}
                    </span>
                    <span className="text-foreground">{rec.symbol}</span>
                    <span className="text-muted-foreground text-sm">• {rec.name}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{rec.reason}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span className="text-foreground">${rec.targetPrice}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="text-foreground">${rec.currentPrice}</span>
                    </div>
                    <div>
                      <span className={isPositive ? 'text-success' : 'text-danger'}>
                        {isPositive ? '+' : ''}{rec.potentialGain || rec.potentialLoss}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 mb-2">
                    <CheckCircle className="w-4 h-4 text-brand-blue" />
                    <span className="text-brand-blue text-sm">{rec.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{rec.timestamp}</span>
                  </div>
                </div>
              </div>

              <button className={`w-full py-2 ${rec.type === 'buy' ? 'gradient-success' : rec.type === 'sell' ? 'bg-danger' : 'bg-brand-blue'} text-white rounded-lg transition-all hover:shadow-lg text-sm`}>
                {rec.type === 'buy' ? 'Execute Buy Order' : rec.type === 'sell' ? 'Execute Sell Order' : 'Monitor Position'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}