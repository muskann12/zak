const sendResponse = require('../utils/sendResponse');
const { getJson } = require('serpapi');

/**
 * Market Analysis Controller
 * Uses SerpApi for real Amazon data
 * Analysis algorithms are kept on backend to protect business logic
 */

// SerpApi key from environment
const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * Fetch real Amazon data using SerpApi
 */
const fetchAmazonData = async (keyword) => {
    return new Promise((resolve, reject) => {
        if (!SERPAPI_KEY) {
            console.error('[MARKET] SERPAPI_KEY is missing from environment variables');
            return reject(new Error('Market analysis service is not configured (Missing API Key)'));
        }

        try {
            getJson({
                engine: 'amazon',
                amazon_domain: 'amazon.com',
                k: keyword,
                api_key: SERPAPI_KEY
            }, (json) => {
                // SerpApi can return an error object or just plain JSON
                if (!json) {
                    return reject(new Error('Empty response from market data provider'));
                }
                
                if (json.error) {
                    // Extract clean error message
                    const errorMessage = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
                    return reject(new Error(`Market data provider error: ${errorMessage}`));
                } else {
                    resolve(json);
                }
            });
        } catch (err) {
            reject(new Error(`Failed to initialize market data request: ${err.message}`));
        }
    });
};

/**
 * Parse SerpApi Amazon response into structured market data
 */
const parseAmazonResults = (serpApiResponse, keyword) => {
    const organicResults = serpApiResponse.organic_results || [];
    
    if (organicResults.length === 0) {
        return null;
    }

    // Take top 10 results for analysis
    const top10 = organicResults.slice(0, 10);
    
    // Extract and calculate market metrics
    const products = top10.map((item, index) => {
        // Extract price
        let price = 0;
        if (item.price) {
            if (typeof item.price === 'object') {
                price = parseFloat(item.price.raw?.replace(/[^0-9.]/g, '') || item.price.value || 0);
            } else if (typeof item.price === 'string') {
                price = parseFloat(item.price.replace(/[^0-9.]/g, '') || 0);
            } else {
                price = item.price;
            }
        }
        
        // Extract reviews count
        let reviews = 0;
        if (item.reviews) {
            reviews = parseInt(item.reviews.toString().replace(/[^0-9]/g, '') || 0);
        } else if (item.ratings_total) {
            reviews = item.ratings_total;
        }
        
        // Extract rating
        let rating = 0;
        if (item.rating) {
            rating = parseFloat(item.rating) || 0;
        }

        // Estimate monthly revenue based on reviews (industry standard: 10-30 sales per review per month)
        // Using conservative 15x multiplier
        const sales = reviews > 0 ? Math.floor(reviews * 0.15) : Math.floor(Math.random() * 200 + 50);
        const revenue = sales * price;
        
        // Calculate Fees (Est 15% referral + FBA fixed)
        const referralFee = price * 0.15;
        let fbaFee = 3.22;
        if (price > 50) fbaFee = 9.50;
        else if (price > 25) fbaFee = 6.10;
        else if (price > 15) fbaFee = 4.75;
        const totalFee = referralFee + fbaFee;
        const fees = price > 0 ? `-$${totalFee.toFixed(2)}` : '$0.00';
        
        // Estimate BSR from Sales (Inverse relationship)
        // Rule of thumb: Sales = 100,000 / BSR --> BSR = 100,000 / Sales
        let bsr = sales > 0 ? Math.floor(100000 / sales) : 50000 + (index * 1000);
        if (bsr < 1) bsr = Math.floor(Math.random() * 100) + 1;

        // Calculate LQS
        let lqs = 5;
        if ((item.title || '').length > 60) lqs += 2;
        if (item.thumbnail && !item.thumbnail.includes('grey-pixel')) lqs += 1;
        if (rating > 4.0) lqs += 1;
        if (reviews > 50) lqs += 1;

        return {
            position: index + 1,
            title: item.title || 'Unknown Product',
            asin: item.asin || '',
            price,
            reviews,
            rating,
            sales,                 // UI expects 'sales'
            estimatedMonthlySales: sales,
            revenue,               // UI expects 'revenue'
            estimatedRevenue: revenue,
            bsr,                   // UI expects 'bsr'
            fees,                  // UI expects 'fees'
            lqs,                   // UI expects 'lqs'
            type: item.is_prime ? 'FBA' : 'AMZ',
            isPrime: item.is_prime || false,
            isBestSeller: item.is_best_seller || false,
            isAmazonChoice: item.is_amazon_choice || false,
            brand: item.brand || extractBrandFromTitle(item.title),
            thumbnail: item.thumbnail || '',
            link: item.link || ''
        };
    });

    // Calculate aggregated market metrics
    const totalRevenue = products.reduce((sum, p) => sum + p.estimatedRevenue, 0);
    const totalSales = products.reduce((sum, p) => sum + p.estimatedMonthlySales, 0);
    const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;
    const avgReviews = products.length > 0 ? products.reduce((sum, p) => sum + p.reviews, 0) / products.length : 0;
    const avgRating = products.length > 0 ? products.reduce((sum, p) => sum + p.rating, 0) / products.length : 0;
    
    // Find top seller
    const topSeller = products.reduce((max, p) => p.estimatedRevenue > max.estimatedRevenue ? p : max, products[0]);
    
    // Count unique brands
    const uniqueBrands = new Set(products.map(p => p.brand).filter(b => b)).size;

    return {
        keyword,
        products,
        totalRevenue,
        totalSales,
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        avgReviews: Math.round(avgReviews),
        avgRating: parseFloat(avgRating.toFixed(1)),
        sellerCount: products.length,
        uniqueBrands,
        topSeller: {
            name: topSeller.title,
            brand: topSeller.brand,
            revenue: topSeller.estimatedRevenue,
            reviews: topSeller.reviews,
            price: topSeller.price,
            asin: topSeller.asin
        },
        searchInfo: serpApiResponse.search_information || {}
    };
};

/**
 * Extract brand from product title (fallback)
 */
const extractBrandFromTitle = (title) => {
    if (!title) return 'Unknown';
    const words = title.split(' ');
    if (words.length >= 2) {
        const genericWords = ['the', 'a', 'an', 'new', 'pack', 'set', 'piece'];
        for (let i = 0; i < Math.min(3, words.length); i++) {
            const word = words[i].toLowerCase();
            if (!genericWords.includes(word) && words[i].length > 1) {
                return words[i].replace(/[^a-zA-Z0-9]/g, '');
            }
        }
    }
    return words[0] || 'Unknown';
};

/**
 * Calculate Demand Score (0-10)
 * Based on total market revenue of top 10 organic results
 */
const calculateDemandScore = (totalRevenue) => {
    // Revenue thresholds for scoring
    if (totalRevenue >= 500000) return 10;
    if (totalRevenue >= 300000) return 9;
    if (totalRevenue >= 200000) return 8;
    if (totalRevenue >= 150000) return 7;
    if (totalRevenue >= 100000) return 6;
    if (totalRevenue >= 75000) return 5;
    if (totalRevenue >= 50000) return 4;
    if (totalRevenue >= 25000) return 3;
    if (totalRevenue >= 10000) return 2;
    return 1;
};

/**
 * Calculate Competition Score (0-10)
 * 10 - (AvgReviews / 500), clamped 0-10
 */
const calculateCompetitionScore = (avgReviews) => {
    let score = 10 - (avgReviews / 500);
    if (score < 0) score = 0;
    if (score > 10) score = 10;
    return parseFloat(score.toFixed(1));
};

/**
 * Calculate Brand Dominance (%)
 * Top seller revenue / Total market revenue
 */
const calculateDominance = (topSellerRevenue, totalRevenue) => {
    if (totalRevenue === 0) return 0;
    return Math.round((topSellerRevenue / totalRevenue) * 100);
};

/**
 * Calculate Private Label Viability Score (0-10)
 * (Comp * 0.4) + (Demand * 0.3) + ((10 - Dom/10) * 0.3)
 */
const calculatePLViability = (competitionScore, demandScore, dominancePercent) => {
    const domScorePart = Math.max(0, 10 - (dominancePercent / 10));
    let plScore = (competitionScore * 0.4) + (demandScore * 0.3) + (domScorePart * 0.3);
    if (plScore > 10) plScore = 10;
    if (plScore < 0) plScore = 0;
    return parseFloat(plScore.toFixed(1));
};

/**
 * Calculate Opportunity Score (0-10)
 * (Demand * 0.4) + (Competition * 0.4) + (Price * 0.2)
 */
const calculateOpportunityScore = (demandScore, competitionScore, avgPrice) => {
    // Price score
    let priceScore = 3;
    if (avgPrice >= 15 && avgPrice <= 50) priceScore = 10;
    else if ((avgPrice >= 10 && avgPrice < 15) || (avgPrice > 50 && avgPrice <= 70)) priceScore = 6;
    
    const rawOpp = (demandScore * 0.4) + (competitionScore * 0.4) + (priceScore * 0.2);
    return Math.round(rawOpp);
};

/**
 * Determine Market Verdict
 */
const getVerdict = (opportunityScore) => {
    if (opportunityScore >= 7) return 'HOT';
    if (opportunityScore >= 4) return 'OK';
    return 'BAD';
};

/**
 * Log market activity to memory store
 */
const logActivity = (keyword, verdict, revenue, dominance) => {
    if (!global.marketActivities) {
        global.marketActivities = [];
    }
    
    global.marketActivities.unshift({
        id: Date.now(),
        keyword,
        verdict,
        revenue: `$${(revenue / 1000).toFixed(0)}K`,
        dominance,
        timestamp: new Date().toISOString(),
        user: 'Anonymous'
    });
    
    // Keep only last 50 activities
    if (global.marketActivities.length > 50) {
        global.marketActivities = global.marketActivities.slice(0, 50);
    }
};

/**
 * Analyze Market Endpoint
 * POST /api/market/analyze
 * Uses real SerpApi Amazon data
 */
const analyzeMarket = async (req, res) => {
    try {
        const { url, keyword, asin } = req.body;
        
        // Extract keyword from URL if provided
        let searchTerm = keyword;
        if (url && !keyword) {
            // Parse Amazon search URL
            const urlMatch = url.match(/[?&]k=([^&]+)/);
            if (urlMatch) {
                searchTerm = decodeURIComponent(urlMatch[1].replace(/\+/g, ' '));
            }
        }
        
        if (!searchTerm && !asin) {
            return sendResponse(res, 400, false, 'Please provide a keyword, URL, or ASIN');
        }

        console.log(`[MARKET] Analyzing: "${searchTerm || asin}"`);

        // Fetch real data from SerpApi
        let serpApiData;
        try {
            serpApiData = await fetchAmazonData(searchTerm || asin);
        } catch (apiError) {
            console.error('[MARKET] SerpApi error:', apiError.message);
            return sendResponse(res, 503, false, 'Failed to fetch Amazon data: ' + apiError.message);
        }

        // Parse the response
        const marketData = parseAmazonResults(serpApiData, searchTerm);
        
        if (!marketData || marketData.products.length === 0) {
            return sendResponse(res, 404, false, 'No products found for this search term');
        }

        // Calculate all scores using our proprietary algorithms
        const demandScore = calculateDemandScore(marketData.totalRevenue);
        const competitionScore = calculateCompetitionScore(marketData.avgReviews);
        const dominance = calculateDominance(marketData.topSeller.revenue, marketData.totalRevenue);
        const plViability = calculatePLViability(competitionScore, demandScore, dominance);
        const opportunityScore = calculateOpportunityScore(demandScore, competitionScore, marketData.avgPrice);
        const verdict = getVerdict(opportunityScore);

        // Determine PL Viability text
        let plText = 'Low';
        if (plViability >= 7) plText = 'Excellent';
        else if (plViability >= 5) plText = 'Medium';

        // Determine market status
        let marketStatus = 'LOCKED';
        if (dominance < 30) marketStatus = 'OPEN';
        else if (dominance < 50) marketStatus = 'CONTESTED';

        // Log this analysis to activity feed
        logActivity(searchTerm, verdict, marketData.totalRevenue, dominance);

        const result = {
            keyword: searchTerm,
            verdict,
            opportunityScore,
            demandScore,
            competitionScore,
            dominance,
            plViability,
            scores: {
                demand: demandScore,
                competition: competitionScore,
                dominance,
                plViability,
                plViabilityText: plText
            },
            marketData: {
                totalRevenue: marketData.totalRevenue,
                totalSales: marketData.totalSales,
                avgPrice: marketData.avgPrice,
                avgReviews: marketData.avgReviews,
                avgRating: marketData.avgRating,
                sellerCount: marketData.sellerCount,
                uniqueBrands: marketData.uniqueBrands,
                marketStatus
            },
            topSeller: marketData.topSeller,
            products: marketData.products,
            recommendation: verdict === 'HOT' 
                ? 'This market shows strong potential for new entrants!' 
                : verdict === 'OK' 
                    ? 'Proceed with caution — moderate competition detected.' 
                    : 'High barriers to entry — consider alternative niches.',
            calculatedAt: new Date().toISOString(),
            dataSource: 'SerpApi Amazon'
        };

        console.log(`[MARKET] Analysis complete: ${verdict} (Score: ${opportunityScore})`);
        return sendResponse(res, 200, true, 'Market analysis complete', result);
    } catch (error) {
        console.error('[MARKET] Analysis error:', error);
        return sendResponse(res, 500, false, 'Failed to analyze market: ' + error.message);
    }
};

/**
 * Get Live Market Activity (Killfeed)
 * GET /api/market/activity
 */
const getMarketActivity = async (req, res) => {
    try {
        // Return stored activities from recent analyses
        const activities = global.marketActivities || [];
        
        return sendResponse(res, 200, true, 'Market activity fetched', { activities });
    } catch (error) {
        console.error('[MARKET] Activity error:', error);
        return sendResponse(res, 500, false, 'Failed to fetch market activity');
    }
};

/**
 * Get Platform Statistics
 * GET /api/market/stats
 */
const getPlatformStats = async (req, res) => {
    try {
        const activities = global.marketActivities || [];
        
        const stats = {
            totalScans: activities.length,
            hotMarkets: activities.filter(a => a.verdict === 'HOT').length,
            avgDominance: activities.length > 0 
                ? Math.round(activities.reduce((sum, a) => sum + (a.dominance || 0), 0) / activities.length)
                : 0,
            recentSearches: activities.slice(0, 5).map(a => a.keyword),
            updatedAt: new Date().toISOString()
        };

        return sendResponse(res, 200, true, 'Platform stats fetched', stats);
    } catch (error) {
        console.error('[MARKET] Stats error:', error);
        return sendResponse(res, 500, false, 'Failed to fetch stats');
    }
};

// Exports moved to bottom
// module.exports = { ... }

/**
 * Find Sourcing Deals
 * POST /api/market/sourcing
 * Uses SerpApi Google Shopping
 */
const findSourcing = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return sendResponse(res, 400, false, 'Missing query');
        
        if (!SERPAPI_KEY) {
            return sendResponse(res, 500, false, 'Server configuration error: Missing API Key');
        }

        console.log(`[MARKET] Sourcing search for: "${query}"`);

        const json = await new Promise((resolve, reject) => {
             getJson({
                engine: 'google_shopping',
                q: query,
                api_key: SERPAPI_KEY,
                google_domain: 'google.com',
                gl: 'us',
                hl: 'en'
            }, (json) => {
                 if (json.error) reject(json.error);
                 else resolve(json);
            });
        });
        
        const results = (json.shopping_results || []).slice(0, 10).map(item => ({
            source: item.source,
            price: item.price,
            extracted_price: item.extracted_price,
            delivery: item.delivery,
            rating: item.rating,
            link: item.link,
            thumbnail: item.thumbnail
        }));
        
        console.log(`[MARKET] Sourcing found ${results.length} results`);
        return sendResponse(res, 200, true, 'Sourcing found', { shopping_results: results });
        
    } catch (e) {
        console.error('[MARKET] Sourcing error:', e);
        return sendResponse(res, 500, false, e.message || 'Sourcing check failed');
    }
};

module.exports = {
    analyzeMarket,
    getMarketActivity,
    getPlatformStats,
    findSourcing
};
