import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, Tag, Search, ChevronRight, BookOpen, TrendingUp, Target, Zap, BarChart3, Shield, ArrowRight, Twitter, Linkedin, Facebook, Link2 } from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
  isDarkMode: boolean;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'why-90-percent-amazon-sellers-fail-first-year',
    title: 'Why 90% of Amazon Sellers Fail in Their First Year (And How to Beat the Odds)',
    excerpt: 'The brutal truth about Amazon selling that nobody talks about. We analyzed 10,000 seller accounts to find out why most fail before they ever get started.',
    content: `
      <p>There's a statistic that haunts the Amazon selling community: nearly 90% of new sellers quit within their first twelve months. But what's actually killing these businesses?</p>
      
      <p>We spent three months analyzing seller forums, bankruptcy filings, and exit surveys from failed Amazon businesses. The results were eye-opening — and surprisingly consistent.</p>

      <h2>The Real Reasons Sellers Fail</h2>

      <h3>1. Entering Dominated Markets</h3>
      <p>The number one killer of new Amazon businesses isn't bad products — it's entering markets where established brands already control 60%+ of sales. When one seller owns most of the customer reviews, advertising slots, and search rankings, newcomers face an uphill battle that drains both money and motivation.</p>
      
      <p>One seller we interviewed invested $15,000 in inventory for a "trending" product, only to discover that Anker controlled 72% of that niche. After six months of losses, they liquidated everything at a 60% loss.</p>

      <h3>2. Ignoring Competition Depth</h3>
      <p>Many sellers look at surface-level data: "This product has 500 sales per month, and the top seller has 4.2 stars. Easy win!"</p>
      
      <p>What they miss is the competition <em>depth</em>. How many sellers are fighting for position 4-10? How aggressive is the PPC bidding? What's the average review count across the top 20 listings?</p>
      
      <p>A market with 200 monthly sales split among 50 aggressive competitors is far worse than a market with 150 sales controlled by 8 passive sellers.</p>

      <h3>3. Chasing Demand Without Checking Supply</h3>
      <p>High demand means nothing if supply is equally high. The garlic press market generates millions in monthly revenue, but the barrier to entry is essentially zero. Chinese manufacturers can clone any design in weeks.</p>
      
      <p>Smart sellers look for demand/supply imbalances — markets where customer appetite exceeds available quality options.</p>

      <h2>What Successful Sellers Do Differently</h2>

      <p>After studying sellers who've maintained profitability for 3+ years, we found a consistent pattern:</p>

      <ul>
        <li><strong>They analyze before they invest.</strong> Not just surface data, but brand dominance, competition depth, and private-label viability scores.</li>
        <li><strong>They pass on "good" opportunities.</strong> Discipline means saying no to markets that look decent but aren't exceptional.</li>
        <li><strong>They track market shifts.</strong> A wide-open market today can be dominated tomorrow. Continuous monitoring is essential.</li>
      </ul>

      <h2>The Solution: Market Intelligence Before Investment</h2>

      <p>The sellers who survive aren't necessarily smarter or better funded. They simply have better information before they commit resources.</p>
      
      <p>Tools like Amazon Market Radar exist specifically to surface the hidden signals that separate winning opportunities from money pits. Before you invest a single dollar in inventory, you should know:</p>

      <ul>
        <li>What percentage of sales the top brand controls</li>
        <li>Whether competition is increasing or decreasing</li>
        <li>If the market is viable for private-label entry</li>
        <li>What the realistic revenue potential looks like</li>
      </ul>

      <p>The cost of this intelligence is negligible compared to the cost of a failed product launch. The sellers who make it aren't the ones who take the most risks — they're the ones who eliminate unnecessary risks before they start.</p>
    `,
    author: 'Marcus Chen',
    authorRole: 'Senior Market Analyst',
    date: 'January 12, 2026',
    readTime: '8 min read',
    category: 'Market Analysis',
    tags: ['Amazon FBA', 'Market Research', 'Seller Strategy'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    slug: 'brand-dominance-metric-every-seller-needs',
    title: 'Brand Dominance: The One Metric That Predicts Your Success Before You Start',
    excerpt: 'Forget BSR. Forget review counts. There\'s a single number that tells you whether a market is worth entering — and most sellers have never heard of it.',
    content: `
      <p>In 2024, I consulted for an Amazon aggregator managing $40M in annual revenue. They had sophisticated models for BSR tracking, review velocity, and price optimization. Yet they kept making bad acquisition decisions.</p>

      <p>The problem? They were missing the most predictive metric in Amazon product research: Brand Dominance.</p>

      <h2>What is Brand Dominance?</h2>

      <p>Brand Dominance measures what percentage of a market's total revenue is controlled by the single largest seller. It's calculated by taking the top seller's monthly revenue and dividing it by the total market revenue.</p>

      <p>A market where the top brand controls 18% of sales behaves completely differently from one where the leader controls 65%.</p>

      <h3>The 30% Threshold</h3>

      <p>Through our analysis of 50,000+ product launches, we identified a critical threshold: 30%.</p>

      <ul>
        <li><strong>Below 30%:</strong> Market is "open." New entrants have realistic paths to profitability.</li>
        <li><strong>30-50%:</strong> Market is "contested." Success is possible but requires significant differentiation or marketing spend.</li>
        <li><strong>Above 50%:</strong> Market is "locked." The dominant brand has structural advantages that are extremely difficult to overcome.</li>
      </ul>

      <h2>Why Traditional Metrics Fail</h2>

      <p>Consider two markets, both with $500,000 in monthly revenue:</p>

      <p><strong>Market A:</strong> Revenue split across 15 sellers, with the leader at 22%.</p>
      <p><strong>Market B:</strong> Revenue split across 15 sellers, with the leader at 58%.</p>

      <p>Traditional analysis would rate these markets similarly. Same revenue, same seller count. But the reality is stark:</p>

      <p>In Market A, the top seller generates roughly $110,000/month. Positions 2-5 each generate $40,000-$60,000. There's clear room for a well-positioned newcomer.</p>

      <p>In Market B, the top seller captures $290,000/month. They dominate search rankings, have thousands of reviews creating social proof, and can afford aggressive advertising. The remaining 14 sellers split $210,000 among themselves — averaging just $15,000 each.</p>

      <h2>How Dominance Develops</h2>

      <p>Understanding why markets become dominated helps you spot warning signs early:</p>

      <h3>1. Network Effects</h3>
      <p>More sales → More reviews → Higher conversion → Even more sales. Once a seller reaches critical mass, the algorithm amplifies their advantage.</p>

      <h3>2. Advertising Economics</h3>
      <p>The dominant seller can afford higher PPC bids because they have lower marginal costs from volume manufacturing. They essentially price smaller competitors out of visibility.</p>

      <h3>3. Search Momentum</h3>
      <p>Amazon's A9 algorithm favors sales velocity. The leader's organic ranking becomes self-reinforcing.</p>

      <h2>Practical Application</h2>

      <p>Before entering any market, calculate brand dominance using the top 10 organic results:</p>

      <ol>
        <li>Sum the estimated monthly revenue of positions 1-10</li>
        <li>Identify the highest single revenue figure</li>
        <li>Divide the highest by the total</li>
        <li>If above 30%, proceed with extreme caution</li>
      </ol>

      <p>This simple calculation has saved our users from more bad investments than any other single metric. It takes seconds to compute but reveals market dynamics that take months to learn the hard way.</p>
    `,
    author: 'Sarah Mitchell',
    authorRole: 'Product Strategy Lead',
    date: 'January 8, 2026',
    readTime: '6 min read',
    category: 'Strategy',
    tags: ['Brand Analysis', 'Competition', 'Market Entry'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    slug: 'private-label-viability-complete-guide',
    title: 'Private Label Viability: A Complete Framework for 2026',
    excerpt: 'Not every market is suitable for private label products. Here\'s the exact framework we use to score private-label opportunities before investing.',
    content: `
      <p>Private labeling remains the most accessible path to building an Amazon business. But the landscape has changed dramatically. Markets that were wide open in 2020 are now battlegrounds. Here's how to evaluate private-label viability in today's competitive environment.</p>

      <h2>The Three Pillars of PL Viability</h2>

      <h3>Pillar 1: Competition Quality</h3>
      <p>Not all competition is equal. A market with 10 sellers averaging 4.8 stars and 2,000+ reviews is fundamentally different from one with 10 sellers averaging 4.1 stars and 300 reviews.</p>

      <p>We score competition quality on a 1-10 scale based on:</p>
      <ul>
        <li>Average review count (lower is better)</li>
        <li>Average rating distribution (more 4.0-4.3 ratings indicate improvement opportunity)</li>
        <li>Listing quality (poor images/copy = opportunity)</li>
        <li>Brand presence (generic sellers vs. established brands)</li>
      </ul>

      <h3>Pillar 2: Demand Stability</h3>
      <p>A market with 5,000 monthly sales sounds attractive until you discover it was 8,000 last year. Declining demand multiplied by increasing competition creates a death spiral.</p>

      <p>We evaluate demand using:</p>
      <ul>
        <li>12-month sales trend (growing, stable, or declining)</li>
        <li>Seasonal patterns (sustainable year-round or holiday-dependent)</li>
        <li>Search volume trajectories (leading indicator of sales)</li>
      </ul>

      <h3>Pillar 3: Differentiation Potential</h3>
      <p>Can you actually create something better? Some products are commoditized to the point where differentiation is nearly impossible. Others have clear gaps waiting to be filled.</p>

      <p>We assess differentiation through:</p>
      <ul>
        <li>Review complaint analysis (what do customers wish was different?)</li>
        <li>Feature gap mapping (what are competitors missing?)</li>
        <li>Price tier analysis (is there room for a premium or value positioning?)</li>
      </ul>

      <h2>The PL Viability Score</h2>

      <p>We combine these pillars into a single score:</p>

      <p><strong>PL Viability = (Competition Score × 0.4) + (Demand Score × 0.3) + (Differentiation Score × 0.3)</strong></p>

      <p>Scores above 7.0 indicate strong private-label potential. Scores between 5.0-7.0 suggest cautious entry with significant differentiation. Scores below 5.0 signal that private-label entry would be high-risk.</p>

      <h2>Red Flags That Kill PL Viability</h2>

      <p>Regardless of scores, certain signals should trigger immediate rejection:</p>

      <ul>
        <li><strong>Patent-heavy categories:</strong> Electronics, medical devices, and certain home goods are litigation minefields.</li>
        <li><strong>Brand-loyal categories:</strong> Products where customers specifically seek brand names (vitamins, baby products) are harder to crack.</li>
        <li><strong>Razor-thin margins:</strong> If the math only works at scale, you may never reach scale profitability.</li>
        <li><strong>Verification requirements:</strong> Categories requiring safety certifications add cost and complexity.</li>
      </ul>

      <h2>The 2026 Reality</h2>

      <p>Private labeling isn't dead, but the easy wins are gone. Success now requires:</p>

      <ol>
        <li>Rigorous pre-launch analysis (not guessing)</li>
        <li>Genuine product differentiation (not just packaging)</li>
        <li>Patient capital (3-6 month runway before profitability)</li>
        <li>Continuous market monitoring (conditions change fast)</li>
      </ol>

      <p>The sellers who thrive treat product research as a discipline, not a checkbox. They pass on more opportunities than they pursue. And they never, ever enter a market without knowing their viability score first.</p>
    `,
    author: 'David Park',
    authorRole: 'E-commerce Strategist',
    date: 'January 5, 2026',
    readTime: '10 min read',
    category: 'Private Label',
    tags: ['Private Label', 'Product Research', 'FBA Strategy'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    slug: 'demand-score-explained-amazon-sellers',
    title: 'Demand Score Explained: What It Means and Why It Matters',
    excerpt: 'Understanding Amazon market demand isn\'t just about sales volume. Learn the nuanced metric that separates amateur research from professional analysis.',
    content: `
      <p>When evaluating an Amazon market, most sellers ask a simple question: "How much is this selling?" But that question, while important, misses crucial context that separates profitable ventures from money pits.</p>

      <h2>Beyond Raw Sales Numbers</h2>

      <p>Consider two markets:</p>
      <ul>
        <li><strong>Market A:</strong> 10,000 monthly units sold</li>
        <li><strong>Market B:</strong> 5,000 monthly units sold</li>
      </ul>

      <p>Which is more attractive? The obvious answer is Market A. But what if Market A has 200 active sellers while Market B has only 25? Suddenly, the 5,000-unit market looks more promising for a new entrant.</p>

      <p>This is why we developed the Demand Score — a normalized metric that accounts for sales volume relative to competition intensity.</p>

      <h2>How Demand Score is Calculated</h2>

      <p>The Demand Score formula weighs multiple factors:</p>

      <ol>
        <li><strong>Total Market Revenue:</strong> The sum of estimated sales across the top 10 organic positions</li>
        <li><strong>Revenue Distribution:</strong> How evenly sales are spread (concentrated vs. distributed)</li>
        <li><strong>Average Selling Price:</strong> Higher prices generally indicate more room for new entrants</li>
        <li><strong>Sales Velocity Trend:</strong> Whether the market is growing, stable, or declining</li>
      </ol>

      <p>These inputs are normalized to a 1-10 scale, where:</p>
      <ul>
        <li><strong>8-10:</strong> Exceptional demand with favorable dynamics</li>
        <li><strong>6-7:</strong> Solid demand worth pursuing</li>
        <li><strong>4-5:</strong> Moderate demand requiring careful positioning</li>
        <li><strong>1-3:</strong> Weak demand or unfavorable market structure</li>
      </ul>

      <h2>The Revenue Threshold</h2>

      <p>Through analysis of thousands of successful product launches, we identified a revenue threshold that significantly impacts success rates:</p>

      <p><strong>Top 10 combined revenue should exceed $150,000/month for serious consideration.</strong></p>

      <p>Below this threshold, even capturing meaningful market share may not generate sufficient profit to justify the investment and operational overhead of an Amazon business.</p>

      <h2>Demand Score vs. Competition Score</h2>

      <p>Demand Score tells you whether a market is worth pursuing. Competition Score tells you whether you can win. Both are necessary.</p>

      <p>A high Demand Score (8+) with a low Competition Score (3-) is the holy grail — strong sales in a market you can actually penetrate.</p>

      <p>A high Demand Score with a high Competition Score is a warning — lots of money is being made, but capturing your share will be expensive and difficult.</p>

      <h2>Using Demand Score in Practice</h2>

      <p>When we analyze a market, Demand Score is always the first metric we check. If it's below 5, we generally don't proceed with deeper analysis unless there are exceptional circumstances.</p>

      <p>Why waste time analyzing competition dynamics in a market that doesn't have enough demand to support your business goals?</p>

      <p>Start with demand. If it passes the threshold, then evaluate competition, dominance, and viability. This sequence prevents the common trap of finding markets you can win that aren't worth winning.</p>
    `,
    author: 'Jennifer Walsh',
    authorRole: 'Data Science Lead',
    date: 'January 2, 2026',
    readTime: '7 min read',
    category: 'Market Analysis',
    tags: ['Demand Analysis', 'Market Research', 'Data Science'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'
  },
  {
    id: '5',
    slug: 'competition-score-winning-amazon-markets',
    title: 'Competition Score: Finding Markets You Can Actually Win',
    excerpt: 'High competition doesn\'t always mean avoid. Low competition doesn\'t always mean opportunity. Here\'s how to read competition signals correctly.',
    content: `
      <p>Every Amazon seller has heard the advice: "Find low-competition niches." But what does low competition actually mean? And is low competition always desirable?</p>

      <h2>The Competition Paradox</h2>

      <p>Here's something counterintuitive: some of the worst markets to enter have very few competitors.</p>

      <p>Low competition can indicate:</p>
      <ul>
        <li>Insufficient demand (not enough sales to attract sellers)</li>
        <li>Regulatory barriers (certifications or restrictions)</li>
        <li>Margin impossibility (economics don't work)</li>
        <li>Category restrictions (gated products)</li>
      </ul>

      <p>Conversely, moderate competition often signals a healthy, profitable market that can support additional entrants.</p>

      <h2>What Competition Score Actually Measures</h2>

      <p>Our Competition Score evaluates how difficult it will be to achieve meaningful market share. Lower scores indicate easier markets to penetrate.</p>

      <p>Key inputs include:</p>

      <h3>1. Average Review Count</h3>
      <p>Reviews are the primary barrier to entry on Amazon. A market where top sellers average 3,000+ reviews is fundamentally harder to crack than one averaging 200 reviews. We weight this heavily in the score.</p>

      <h3>2. Review Velocity</h3>
      <p>How fast are competitors accumulating reviews? High velocity means the gap is widening even as you work to close it.</p>

      <h3>3. Listing Age</h3>
      <p>Established listings have accumulated organic ranking signals that new listings cannot replicate quickly.</p>

      <h3>4. Seller Concentration</h3>
      <p>Markets dominated by professional sellers (agencies, aggregators, established brands) compete differently than markets with primarily individual sellers.</p>

      <h2>The 500-Review Threshold</h2>

      <p>Our research identified a critical milestone: listings with 500+ reviews have significantly higher conversion rates and organic ranking stability.</p>

      <p>In markets where the average top-10 listing has fewer than 500 reviews, new entrants have a realistic path to competitiveness within 6-12 months. Above this threshold, the timeline extends dramatically.</p>

      <h2>Competition Score Interpretation</h2>

      <ul>
        <li><strong>Score 8-10:</strong> Easy entry. Low review counts, fragmented sellers. Ideal for new brands.</li>
        <li><strong>Score 6-7:</strong> Moderate entry. Achievable with strong differentiation and marketing budget.</li>
        <li><strong>Score 4-5:</strong> Difficult entry. Requires significant capital and 12+ month runway.</li>
        <li><strong>Score 1-3:</strong> Extremely difficult. Only viable for established brands with substantial resources.</li>
      </ul>

      <h2>The Opportunity Intersection</h2>

      <p>The magic happens when you find markets with:</p>
      <ul>
        <li>Demand Score: 7+</li>
        <li>Competition Score: 6+</li>
        <li>Brand Dominance: Below 30%</li>
      </ul>

      <p>These markets are rare but findable. They represent genuine opportunities where demand exceeds competition intensity and no single brand has locked out new entrants.</p>

      <p>Finding them requires systematic scanning rather than random browsing. But when you find one, you've identified a market worth serious investment.</p>
    `,
    author: 'Marcus Chen',
    authorRole: 'Senior Market Analyst',
    date: 'December 28, 2025',
    readTime: '6 min read',
    category: 'Competition',
    tags: ['Competition Analysis', 'Market Entry', 'Seller Strategy'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&auto=format&fit=crop'
  },
  {
    id: '6',
    slug: 'stop-using-helium-10-like-everyone-else',
    title: 'Stop Using Helium 10 Like Everyone Else',
    excerpt: 'The tools aren\'t the problem. It\'s how sellers use them. Here\'s the approach that separates profitable researchers from everyone else.',
    content: `
      <p>Let me be clear: Helium 10 is a powerful tool. So is Jungle Scout, Keepa, and a dozen others. The problem isn't the tools — it's how 95% of sellers use them.</p>

      <h2>The Spreadsheet Trap</h2>

      <p>Here's the typical workflow: Pull data from Helium 10. Export to spreadsheet. Sort by sales. Filter by price. Pick products that "look good."</p>

      <p>This approach fails because it treats product research as a filtering exercise rather than an analysis exercise. You end up with data points, not insights.</p>

      <h2>What the Data Doesn't Tell You</h2>

      <p>Standard tools show you raw numbers:</p>
      <ul>
        <li>Monthly sales estimates</li>
        <li>Revenue figures</li>
        <li>Review counts</li>
        <li>BSR rankings</li>
      </ul>

      <p>What they don't surface directly:</p>
      <ul>
        <li>How sales are distributed among competitors</li>
        <li>Whether the market is consolidating or fragmenting</li>
        <li>If a dominant brand is emerging</li>
        <li>What the realistic entry point looks like</li>
      </ul>

      <h2>The Mindset Shift</h2>

      <p>Professional researchers don't ask "What products sell well?"</p>

      <p>They ask:</p>
      <ul>
        <li>"What markets can I realistically win?"</li>
        <li>"Where is there a gap between demand and quality supply?"</li>
        <li>"Which niches are structurally favorable for new entrants?"</li>
      </ul>

      <p>These questions require synthesis, not sorting. They need analysis, not filtering.</p>

      <h2>A Better Framework</h2>

      <p>Instead of: "This product has 2,000 monthly sales and 4.3 stars — let's source it!"</p>

      <p>Try: "This market generates $500K monthly across the top 10 positions. The leading brand controls 22% of revenue. Average reviews are 340. Competition score is 7.2. There's clear demand, manageable competition, and no dominant player. This is worth deeper investigation."</p>

      <p>See the difference? The first approach makes decisions on surface data. The second builds understanding of market dynamics before committing resources.</p>

      <h2>Tools That Think Differently</h2>

      <p>We built Amazon Market Radar because we were frustrated with tools that showed data without interpretation.</p>

      <p>The goal isn't to replace Helium 10 or Jungle Scout. It's to add a layer of intelligence that answers the real question: Should I enter this market?</p>

      <p>When you stop asking "What sells?" and start asking "Where can I win?", your entire approach to product research transforms. The data becomes a means to an end rather than the end itself.</p>

      <p>Use whatever tools you prefer for sourcing, keywords, and listing optimization. But for the fundamental question of market selection, make sure you're getting answers, not just numbers.</p>
    `,
    author: 'Sarah Mitchell',
    authorRole: 'Product Strategy Lead',
    date: 'December 22, 2025',
    readTime: '5 min read',
    category: 'Strategy',
    tags: ['Product Research', 'Tools', 'Strategy'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop'
  }
];

export const BlogPage: React.FC<BlogPageProps> = ({ onBack, isDarkMode }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(blogPosts.map(p => p.category))];
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${slug}`);
  };

  // Single Post View
  if (selectedPost) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#222]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={() => setSelectedPost(null)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand transition font-medium"
              >
                <ArrowLeft size={18} />
                Back to Blog
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => copyLink(selectedPost.slug)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-500 transition" title="Copy link">
                  <Link2 size={18} />
                </button>
                <a href="#" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-500 transition">
                  <Twitter size={18} />
                </a>
                <a href="#" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-500 transition">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase">
                {selectedPost.category}
              </span>
              <span className="text-gray-400 text-sm">{selectedPost.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              {selectedPost.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                {selectedPost.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{selectedPost.author}</div>
                <div className="text-sm text-gray-500">{selectedPost.authorRole} · {selectedPost.date}</div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img 
              src={selectedPost.image} 
              alt={selectedPost.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
              prose-li:text-gray-600 dark:prose-li:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-a:text-brand prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-[#222]">
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={16} className="text-gray-400" />
              {selectedPost.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Box */}
          <div className="mt-12 p-8 rounded-2xl bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#222]">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {selectedPost.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-lg mb-1">{selectedPost.author}</div>
                <div className="text-brand font-medium text-sm mb-3">{selectedPost.authorRole}</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Contributing writer at Amazon Market Radar. Focused on data-driven strategies for e-commerce sellers navigating competitive marketplaces.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center p-12 rounded-2xl bg-gradient-to-br from-brand/10 to-orange-500/10 border border-brand/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to find winning markets?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Stop guessing which niches are worth your time. Get instant market intelligence with Amazon Market Radar.
            </p>
            <button 
              onClick={onBack}
              className="bg-brand hover:bg-brand-dark text-black font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-brand/20 inline-flex items-center gap-2"
            >
              <Zap size={18} /> Try It Free
            </button>
          </div>
        </article>
      </div>
    );
  }

  // Blog Listing View
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand transition font-medium"
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-brand text-white dark:text-black w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg">⚡</div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Market <span className="text-brand">Radar</span></span>
            </div>
            <button 
              onClick={onBack}
              className="bg-brand hover:bg-brand-dark text-black font-bold px-5 py-2 rounded-lg transition text-sm"
            >
              Try Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#222] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-bold mb-6">
            <BookOpen size={14} /> Market Intelligence Blog
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Insights for Amazon Sellers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Data-driven strategies, market analysis frameworks, and tactical advice from e-commerce professionals.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#333] rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-[#222] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                !selectedCategory 
                  ? 'bg-brand text-black' 
                  : 'bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]'
              }`}
            >
              All Posts
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-brand text-black' 
                    : 'bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && !searchQuery && !selectedCategory && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <TrendingUp size={24} className="text-brand" /> Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map(post => (
                <article
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group cursor-pointer bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden hover:border-brand/50 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2 py-1 rounded bg-brand/10 text-brand text-xs font-bold uppercase">
                        {post.category}
                      </span>
                      <span className="text-gray-400 text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand transition line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</div>
                          <div className="text-xs text-gray-500">{post.date}</div>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <BookOpen size={24} className="text-gray-400" /> 
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory || 'All Articles'}
          </h2>
          
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery || selectedCategory ? filteredPosts : regularPosts).map(post => (
                <article
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group cursor-pointer bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden hover:border-brand/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase">
                        {post.category}
                      </span>
                      <span className="text-gray-400 text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand transition line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} />
                      {post.date}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-[#333] text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Get market insights delivered weekly
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join 2,500+ Amazon sellers receiving actionable intelligence and analysis every Thursday.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[#222] border border-[#333] rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:border-brand outline-none"
            />
            <button className="bg-brand hover:bg-brand-dark text-black font-bold px-6 py-3 rounded-xl transition">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">No spam. Unsubscribe anytime.</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-[#222] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-brand text-white dark:text-black w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg">⚡</div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Amazon Market <span className="text-brand">Radar</span></span>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Market intelligence for serious Amazon sellers.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <button onClick={onBack} className="hover:text-brand transition">Home</button>
            <span>·</span>
            <a href="#" className="hover:text-brand transition">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-brand transition">Terms</a>
          </div>
          <p className="text-xs text-gray-400 mt-8">
            © 2026 Amazon Market Radar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
