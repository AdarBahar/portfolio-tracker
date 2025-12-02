import { X, TrendingUp, TrendingDown, BookOpen, Lightbulb, BarChart3, Globe, DollarSign } from 'lucide-react';

interface StockInfoModalProps {
  asset: {
    symbol: string;
    name: string;
    type?: string;
    currentPrice: number;
    changePercent: number;
  };
  onClose: () => void;
}

export function StockInfoModal({ asset, onClose }: StockInfoModalProps) {
  // Educational content based on stock symbol
  const getStockEducation = () => {
    const commonFactors = [
      {
        icon: BarChart3,
        title: 'Earnings Reports',
        description: 'Quarterly earnings can significantly impact stock prices. Better-than-expected results typically drive prices up, while disappointments can cause drops.'
      },
      {
        icon: Globe,
        title: 'Market Sentiment',
        description: 'Overall market trends, investor confidence, and macroeconomic indicators influence stock movements. Positive news drives buying, negative news triggers selling.'
      },
      {
        icon: DollarSign,
        title: 'Supply & Demand',
        description: 'Stock prices are determined by buyer and seller activity. High demand with limited supply increases prices, while excess supply lowers them.'
      }
    ];

    // Symbol-specific insights
    const specificInsights: Record<string, any> = {
      'AAPL': {
        sector: 'Technology',
        keyDrivers: [
          'iPhone sales performance and new product launches',
          'Services revenue growth (Apple Music, iCloud, App Store)',
          'China market performance and supply chain dynamics',
          'Innovation in AR/VR and new product categories'
        ],
        recentFactors: [
          'Strong services segment growth offsetting hardware seasonality',
          'Investor interest in AI capabilities and integration',
          'Stock buyback programs supporting share price'
        ],
        learnMore: [
          'Apple is a "blue-chip" stock - large, established companies with stable earnings',
          'P/E ratio (Price-to-Earnings) helps determine if a stock is overvalued or undervalued',
          'Market cap represents total company value (shares × price)'
        ]
      },
      'GOOGL': {
        sector: 'Technology',
        keyDrivers: [
          'Digital advertising revenue from Search and YouTube',
          'Google Cloud growth and AI development',
          'Regulatory challenges and antitrust scrutiny',
          'Innovation in AI and machine learning products'
        ],
        recentFactors: [
          'AI competition with ChatGPT driving investment in Bard/Gemini',
          'Cloud computing growth amid digital transformation trends',
          'Search market dominance and advertising pricing power'
        ],
        learnMore: [
          'Alphabet uses a dual-class share structure (GOOGL vs GOOG)',
          'Revenue diversification reduces reliance on single income stream',
          'Market capitalization determines company size classification'
        ]
      },
      'MSFT': {
        sector: 'Technology',
        keyDrivers: [
          'Azure cloud computing platform growth',
          'Office 365 and enterprise software subscriptions',
          'AI integration through OpenAI partnership',
          'Gaming division (Xbox, Activision acquisition)'
        ],
        recentFactors: [
          'Azure competing strongly with AWS for cloud market share',
          'AI Copilot integration across product suite',
          'Stable enterprise customer base providing recurring revenue'
        ],
        learnMore: [
          'SaaS (Software as a Service) model provides predictable recurring revenue',
          'Dividend payments provide income in addition to price appreciation',
          'Tech sector can be volatile but offers growth potential'
        ]
      },
      'TSLA': {
        sector: 'Automotive/Technology',
        keyDrivers: [
          'Electric vehicle delivery numbers and production capacity',
          'Battery technology improvements and cost reductions',
          'Full Self-Driving (FSD) development and regulatory approval',
          'Energy storage and solar business expansion'
        ],
        recentFactors: [
          'Price cuts impacting margins but boosting volume',
          'Competition increasing from traditional automakers',
          'CEO focus and company direction affecting investor sentiment'
        ],
        learnMore: [
          'Growth stocks prioritize revenue growth over current profits',
          'High volatility means larger price swings - higher risk and reward',
          'Forward P/E ratio reflects future earnings expectations'
        ]
      },
      'NVDA': {
        sector: 'Technology',
        keyDrivers: [
          'AI chip demand from data centers and enterprises',
          'Gaming GPU market share and new product launches',
          'Data center growth driven by AI/ML workloads',
          'Cryptocurrency mining demand (cyclical)'
        ],
        recentFactors: [
          'Explosive AI demand driving record data center sales',
          'Supply constraints limiting ability to meet demand',
          'Competition from AMD and custom AI chips'
        ],
        learnMore: [
          'Semiconductor stocks are cyclical - they follow industry boom/bust cycles',
          'Revenue concentration risk when few customers drive most sales',
          'Technological leadership can create "moat" - competitive advantage'
        ]
      },
      'AMZN': {
        sector: 'E-Commerce/Technology',
        keyDrivers: [
          'AWS (Amazon Web Services) cloud computing dominance',
          'E-commerce market share and Prime membership growth',
          'Advertising business expansion',
          'Logistics network and delivery capabilities'
        ],
        recentFactors: [
          'AWS profitability subsidizing e-commerce investments',
          'Third-party seller services revenue growing',
          'Cost-cutting measures improving operating margins'
        ],
        learnMore: [
          'Diversified business model reduces single-sector risk',
          'Operating margin expansion can drive significant profit growth',
          'Free cash flow measures actual cash generation ability'
        ]
      },
      'META': {
        sector: 'Technology',
        keyDrivers: [
          'Advertising revenue from Facebook and Instagram',
          'User engagement and daily active users (DAU)',
          'Metaverse investments and Reality Labs spending',
          'Regulatory scrutiny and privacy changes'
        ],
        recentFactors: [
          'Improved ad targeting despite iOS privacy changes',
          'Threads launch competing with Twitter/X',
          'Cost discipline improving profitability (Year of Efficiency)'
        ],
        learnMore: [
          'User metrics (DAU, MAU) are key performance indicators',
          'Platform businesses benefit from network effects',
          'R&D spending can hurt short-term profits but drive long-term growth'
        ]
      },
      'BTC-USD': {
        sector: 'Cryptocurrency',
        keyDrivers: [
          'Institutional adoption and Bitcoin ETF approvals',
          'Halving events reducing new supply every 4 years',
          'Regulatory developments and government policies',
          'Macroeconomic conditions and inflation concerns'
        ],
        recentFactors: [
          'Spot Bitcoin ETF approvals increasing accessibility',
          'Bitcoin viewed as "digital gold" and inflation hedge',
          'Correlation with tech stocks and risk assets'
        ],
        learnMore: [
          'Cryptocurrencies are highly volatile - prices can swing dramatically',
          'Limited supply (21 million max) creates scarcity dynamics',
          'Decentralized nature means no central authority controls it'
        ]
      },
      'ETH-USD': {
        sector: 'Cryptocurrency',
        keyDrivers: [
          'Smart contract platform adoption and DeFi growth',
          'Network upgrades and Ethereum 2.0 transition',
          'Gas fees and network congestion',
          'Competition from alternative blockchains'
        ],
        recentFactors: [
          'Proof-of-Stake transition reducing energy consumption',
          'Layer 2 solutions improving scalability',
          'NFT and DeFi applications driving network usage'
        ],
        learnMore: [
          'Smart contracts enable programmable applications on blockchain',
          'Gas fees represent transaction costs on the network',
          'Staking allows earning rewards by helping secure the network'
        ]
      }
    };

    const info = specificInsights[asset.symbol] || {
      sector: 'General Market',
      keyDrivers: [
        'Company earnings and revenue growth',
        'Industry trends and competitive position',
        'Economic conditions and interest rates',
        'Company management and strategic decisions'
      ],
      recentFactors: [
        'Overall market sentiment affecting stock movement',
        'Sector rotation as investors move between industries',
        'Company-specific news and announcements'
      ],
      learnMore: [
        'Diversification helps reduce risk by spreading investments',
        'Long-term investing typically outperforms short-term trading',
        'Research and understand what you invest in'
      ]
    };

    return { ...info, commonFactors };
  };

  const education = getStockEducation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl gradient-card rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-purple/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-brand-purple" />
            </div>
            <div>
              <h2 className="text-foreground mb-1">Learn About {asset.symbol}</h2>
              <p className="text-muted-foreground text-sm">{asset.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Current Price Movement */}
            <div className="bg-muted/20 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                {asset.changePercent >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-danger" />
                )}
                <h3 className="text-foreground">Current Price Movement</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-2">
                {asset.symbol} is currently trading at ${asset.currentPrice.toLocaleString()} with a{' '}
                <span className={asset.changePercent >= 0 ? 'text-success' : 'text-danger'}>
                  {asset.changePercent >= 0 ? 'gain' : 'loss'} of {Math.abs(asset.changePercent).toFixed(2)}%
                </span>.
              </p>
              <p className="text-muted-foreground text-sm">
                {asset.changePercent >= 0 
                  ? 'This positive movement could be due to favorable market conditions, good company news, or increased investor demand.'
                  : 'This decline could be due to market conditions, profit-taking by investors, or concerns about the company or sector.'}
              </p>
            </div>

            {/* Sector Information */}
            <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-brand-blue" />
                <h3 className="text-foreground">Sector: {education.sector}</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Understanding the sector helps you see how broader industry trends affect this stock.
              </p>
            </div>

            {/* Key Price Drivers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-brand-purple" />
                <h3 className="text-foreground">What Drives {asset.symbol}'s Price?</h3>
              </div>
              <div className="space-y-2">
                {education.keyDrivers.map((driver: string, index: number) => (
                  <div key={index} className="flex gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm">{driver}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Factors */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <h3 className="text-foreground">Recent Market Factors</h3>
              </div>
              <div className="space-y-2">
                {education.recentFactors.map((factor: string, index: number) => (
                  <div key={index} className="flex gap-3 p-3 bg-success/10 rounded-lg border border-success/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm">{factor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* General Market Factors */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-warning" />
                <h3 className="text-foreground">General Market Principles</h3>
              </div>
              <div className="space-y-3">
                {education.commonFactors.map((factor: any, index: number) => {
                  const Icon = factor.icon;
                  return (
                    <div key={index} className="bg-muted/20 border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-warning" />
                        <h4 className="text-foreground text-sm">{factor.title}</h4>
                      </div>
                      <p className="text-muted-foreground text-sm">{factor.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Educational Tips */}
            <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-brand-purple" />
                <h3 className="text-foreground">Investment Learning Tips</h3>
              </div>
              <div className="space-y-2">
                {education.learnMore.map((tip: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-2 flex-shrink-0" />
                    <p className="text-brand-purple text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
              <p className="text-warning text-xs">
                <strong>Educational Purpose Only:</strong> This information is for learning purposes. 
                Always conduct thorough research and consider consulting with a financial advisor before making investment decisions. 
                Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <button
            onClick={onClose}
            className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-lg transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
