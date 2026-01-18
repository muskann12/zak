const sendResponse = require('../utils/sendResponse');

/**
 * Blog Controller
 * Stores and serves blog content from backend
 * This keeps content management centralized and secure
 */

// Blog posts data (In production, this would be in a database)
const blogPosts = [
  {
    id: '1',
    slug: 'why-90-percent-amazon-sellers-fail-first-year',
    title: 'Why 90% of Amazon Sellers Fail in Their First Year (And How to Beat the Odds)',
    excerpt: 'The brutal truth about Amazon selling that nobody talks about. We analyzed 10,000 seller accounts to find out why most fail before they ever get started.',
    content: `<p>There's a statistic that haunts the Amazon selling community: nearly 90% of new sellers quit within their first twelve months. But what's actually killing these businesses?</p>
      
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

      <p>The cost of this intelligence is negligible compared to the cost of a failed product launch. The sellers who make it aren't the ones who take the most risks — they're the ones who eliminate unnecessary risks before they start.</p>`,
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
    content: `<p>In 2024, I consulted for an Amazon aggregator managing $40M in annual revenue. They had sophisticated models for BSR tracking, review velocity, and price optimization. Yet they kept making bad acquisition decisions.</p>

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

      <h2>Practical Application</h2>

      <p>Before entering any market, calculate brand dominance using the top 10 organic results:</p>

      <ol>
        <li>Sum the estimated monthly revenue of positions 1-10</li>
        <li>Identify the highest single revenue figure</li>
        <li>Divide the highest by the total</li>
        <li>If above 30%, proceed with extreme caution</li>
      </ol>

      <p>This simple calculation has saved our users from more bad investments than any other single metric. It takes seconds to compute but reveals market dynamics that take months to learn the hard way.</p>`,
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
    content: `<p>Private labeling remains the most accessible path to building an Amazon business. But the landscape has changed dramatically. Markets that were wide open in 2020 are now battlegrounds. Here's how to evaluate private-label viability in today's competitive environment.</p>

      <h2>The Three Pillars of PL Viability</h2>

      <h3>Pillar 1: Competition Quality</h3>
      <p>Not all competition is equal. A market with 10 sellers averaging 4.8 stars and 2,000+ reviews is fundamentally different from one with 10 sellers averaging 4.1 stars and 300 reviews.</p>

      <h3>Pillar 2: Demand Stability</h3>
      <p>A market with 5,000 monthly sales sounds attractive until you discover it was 8,000 last year. Declining demand multiplied by increasing competition creates a death spiral.</p>

      <h3>Pillar 3: Differentiation Potential</h3>
      <p>Can you actually create something better? Some products are commoditized to the point where differentiation is nearly impossible. Others have clear gaps waiting to be filled.</p>

      <h2>The PL Viability Score</h2>

      <p>We combine these pillars into a single score:</p>

      <p><strong>PL Viability = (Competition Score × 0.4) + (Demand Score × 0.3) + (Differentiation Score × 0.3)</strong></p>

      <p>Scores above 7.0 indicate strong private-label potential. Scores between 5.0-7.0 suggest cautious entry with significant differentiation. Scores below 5.0 signal that private-label entry would be high-risk.</p>`,
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
    content: `<p>When evaluating an Amazon market, most sellers ask a simple question: "How much is this selling?" But that question, while important, misses crucial context that separates profitable ventures from money pits.</p>

      <h2>Beyond Raw Sales Numbers</h2>

      <p>Consider two markets:</p>
      <ul>
        <li><strong>Market A:</strong> 10,000 monthly units sold</li>
        <li><strong>Market B:</strong> 5,000 monthly units sold</li>
      </ul>

      <p>Which is more attractive? The obvious answer is Market A. But what if Market A has 200 active sellers while Market B has only 25? Suddenly, the 5,000-unit market looks more promising for a new entrant.</p>

      <h2>How Demand Score is Calculated</h2>

      <p>The Demand Score formula weighs multiple factors:</p>

      <ol>
        <li><strong>Total Market Revenue:</strong> The sum of estimated sales across the top 10 organic positions</li>
        <li><strong>Revenue Distribution:</strong> How evenly sales are spread (concentrated vs. distributed)</li>
        <li><strong>Average Selling Price:</strong> Higher prices generally indicate more room for new entrants</li>
        <li><strong>Sales Velocity Trend:</strong> Whether the market is growing, stable, or declining</li>
      </ol>

      <h2>The Revenue Threshold</h2>

      <p><strong>Top 10 combined revenue should exceed $150,000/month for serious consideration.</strong></p>

      <p>Below this threshold, even capturing meaningful market share may not generate sufficient profit to justify the investment and operational overhead of an Amazon business.</p>`,
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
    content: `<p>Every Amazon seller has heard the advice: "Find low-competition niches." But what does low competition actually mean? And is low competition always desirable?</p>

      <h2>The Competition Paradox</h2>

      <p>Here's something counterintuitive: some of the worst markets to enter have very few competitors.</p>

      <p>Low competition can indicate:</p>
      <ul>
        <li>Insufficient demand (not enough sales to attract sellers)</li>
        <li>Regulatory barriers (certifications or restrictions)</li>
        <li>Margin impossibility (economics don't work)</li>
        <li>Category restrictions (gated products)</li>
      </ul>

      <h2>What Competition Score Actually Measures</h2>

      <p>Our Competition Score evaluates how difficult it will be to achieve meaningful market share. Lower scores indicate easier markets to penetrate.</p>

      <h3>The 500-Review Threshold</h3>

      <p>Our research identified a critical milestone: listings with 500+ reviews have significantly higher conversion rates and organic ranking stability.</p>

      <p>In markets where the average top-10 listing has fewer than 500 reviews, new entrants have a realistic path to competitiveness within 6-12 months.</p>`,
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
    content: `<p>Let me be clear: Helium 10 is a powerful tool. So is Jungle Scout, Keepa, and a dozen others. The problem isn't the tools — it's how 95% of sellers use them.</p>

      <h2>The Spreadsheet Trap</h2>

      <p>Here's the typical workflow: Pull data from Helium 10. Export to spreadsheet. Sort by sales. Filter by price. Pick products that "look good."</p>

      <p>This approach fails because it treats product research as a filtering exercise rather than an analysis exercise.</p>

      <h2>The Mindset Shift</h2>

      <p>Professional researchers don't ask "What products sell well?"</p>

      <p>They ask:</p>
      <ul>
        <li>"What markets can I realistically win?"</li>
        <li>"Where is there a gap between demand and quality supply?"</li>
        <li>"Which niches are structurally favorable for new entrants?"</li>
      </ul>

      <h2>A Better Framework</h2>

      <p>Instead of: "This product has 2,000 monthly sales and 4.3 stars — let's source it!"</p>

      <p>Try: "This market generates $500K monthly across the top 10 positions. The leading brand controls 22% of revenue. Average reviews are 340. Competition score is 7.2. There's clear demand, manageable competition, and no dominant player. This is worth deeper investigation."</p>`,
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

/**
 * Get All Blog Posts
 * GET /api/blog
 */
const getAllPosts = async (req, res) => {
    try {
        const { category, search, featured } = req.query;
        
        let filteredPosts = [...blogPosts];
        
        // Filter by category
        if (category) {
            filteredPosts = filteredPosts.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        
        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filteredPosts = filteredPosts.filter(p => 
                p.title.toLowerCase().includes(searchLower) ||
                p.excerpt.toLowerCase().includes(searchLower) ||
                p.tags.some(t => t.toLowerCase().includes(searchLower))
            );
        }
        
        // Filter by featured
        if (featured === 'true') {
            filteredPosts = filteredPosts.filter(p => p.featured);
        }
        
        // Return posts without full content for listing
        const postsWithoutContent = filteredPosts.map(({ content, ...rest }) => rest);
        
        // Get unique categories
        const categories = [...new Set(blogPosts.map(p => p.category))];
        
        return sendResponse(res, 200, true, 'Blog posts fetched', {
            posts: postsWithoutContent,
            categories,
            total: filteredPosts.length
        });
    } catch (error) {
        console.error('[BLOG] Error fetching posts:', error);
        return sendResponse(res, 500, false, 'Failed to fetch blog posts');
    }
};

/**
 * Get Single Blog Post
 * GET /api/blog/:slug
 */
const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const post = blogPosts.find(p => p.slug === slug);
        
        if (!post) {
            return sendResponse(res, 404, false, 'Blog post not found');
        }
        
        // Get related posts (same category, excluding current)
        const relatedPosts = blogPosts
            .filter(p => p.category === post.category && p.id !== post.id)
            .slice(0, 3)
            .map(({ content, ...rest }) => rest);
        
        return sendResponse(res, 200, true, 'Blog post fetched', {
            post,
            relatedPosts
        });
    } catch (error) {
        console.error('[BLOG] Error fetching post:', error);
        return sendResponse(res, 500, false, 'Failed to fetch blog post');
    }
};

/**
 * Get Blog Categories
 * GET /api/blog/categories
 */
const getCategories = async (req, res) => {
    try {
        const categories = [...new Set(blogPosts.map(p => p.category))];
        const categoriesWithCount = categories.map(cat => ({
            name: cat,
            count: blogPosts.filter(p => p.category === cat).length
        }));
        
        return sendResponse(res, 200, true, 'Categories fetched', categoriesWithCount);
    } catch (error) {
        console.error('[BLOG] Error fetching categories:', error);
        return sendResponse(res, 500, false, 'Failed to fetch categories');
    }
};

module.exports = {
    getAllPosts,
    getPostBySlug,
    getCategories
};
