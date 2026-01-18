const { calculateProfitability, estimateSales, calculateFBAFees } = require('../services/amazonService');

// @desc    Analyze Products (Called by Extension Content Script)
// @route   POST /api/v1/xray/analyze
exports.analyzeProducts = async (req, res) => {
  try {
      const { rawItems } = req.body;

      if (!rawItems || !Array.isArray(rawItems)) {
          return res.status(400).json({ error: 'Invalid data format' });
      }

      // Process raw data from extension with backend algorithms
      const analyzedData = rawItems.map(p => {
        const estSales = estimateSales(p.bsr, p.category || 'General');
        const fees = calculateFBAFees(p.price);
        return {
          ...p,
          estSales,
          revenue: Math.round(estSales * p.price),
          fees,
          profit: (p.price - fees - (p.price * 0.15)).toFixed(2)
        };
      });

      res.json({ success: true, data: analyzedData });

  } catch (error) {
      console.error("Xray Error:", error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Get Demo Data (For Web Dashboard Demo)
// @route   GET /api/v1/xray/demo-data
exports.getDemoData = async (req, res) => {
    // Generates realistic niche data (e.g., "Kitchen & Dining" - Wood Cutting Boards)
    const count = Number(req.query.count) || 10;
    
    const brands = ["KitchenKing", "ChefMaster", "OrganicBamboo", "CulinaryElite", "HomeBasic", "GreenEarth", "ProCook", "DailyKitchen"];
    const titles = [
        "Organic Bamboo Cutting Board with Juice Groove - Extra Large 18x12",
        "Professional Wood Chopping Block - End Grain Acacia",
        "3-Piece Plastic Cutting Board Set, Dishwasher Safe, Non-Slip",
        "Premium Walnut Cutting Board - Made in USA - Reversible",
        "Flexible Cutting Mats, Set of 4, Color Coded with Icons",
        "Heavy Duty Butcher Block - Maple Wood - 2 Inch Thick",
        "Marble Pastry Board with Wood Accents - 16x20",
        "Teak Wood Cutting Board - Rectangular with Hand Grip",
        "Stainless Steel Countertop Protector / Cutting Board",
        "Glass Cutting Board - Tempered - Clear - 12x15"
    ];

    const generateHistory = (baseValue, volatility, type) => {
        let current = baseValue;
        return Array.from({ length: 90 }, (_, j) => {
            const change = (Math.random() - 0.5) * volatility;
            current += change;
            // BSR tends to spike down (better rank) when sales happen
            if (type === 'bsr') {
                if (current < 1) current = 1;
                // Random sales spike (Rank improves significantly)
                if (Math.random() > 0.8) current = current * 0.8; 
                // Natural decay (Rank gets worse)
                else current = current * 1.02;
            } else {
                 if (current < baseValue * 0.7) current = baseValue * 0.7;
                 if (current > baseValue * 1.3) current = baseValue * 1.3;
            }
            return { date: new Date(Date.now() - (89 - j) * 24 * 60 * 60 * 1000).toISOString(), value: Number(current.toFixed(2)) };
        });
    };

    const demoProducts = Array.from({ length: count }).map((_, i) => {
        const isPreserved = i < titles.length;
        const brand = isPreserved ? brands[i % brands.length] : brands[Math.floor(Math.random() * brands.length)];
        const title = isPreserved ? titles[i] : `${brand} Kitchen Essential - Item #${i + 100}`;
        const price = isPreserved ? (20 + (i * 5)) + 0.99 : parseFloat((15 + Math.random() * 40).toFixed(2));
        const rating = 3.5 + (Math.random() * 1.5);
        const reviewCount = Math.floor(50 + Math.random() * 5000);
        const bsr = Math.floor(100 + Math.random() * 15000);
        
        // Simulating Revenue Logic
        const estSales = Math.floor(300000 / (bsr + 1000) * (rating / 3)); 
        const revenue = estSales * price;
        const fees = price * 0.15 + 4.50; // Referral + FBA

        return {
            asin: `B0${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            title: title,
            price: price,
            revenue: Number(revenue.toFixed(2)),
            fees: Number(fees.toFixed(2)),
            rating: Number(rating.toFixed(1)),
            reviewCount: reviewCount,
            imgUrl: `https://placehold.co/50/orange/white?text=${title.substring(0,3)}`, // Placeholder with initials
            estSales: Number(estSales.toFixed(0)),
            bsr: bsr,
            brand: brand,
            sellerType: Math.random() > 0.3 ? "FBA" : "AMZ",
            lqs: Math.floor(5 + Math.random() * 5), // Listing Quality Score
            // Detailed 90-day history for charts
            priceHistory: generateHistory(price, 1, 'price'),
            bsrHistory: generateHistory(bsr, bsr * 0.05, 'bsr'),
            reviewVelocity: Math.floor(Math.random() * 50)
        };
    });
    
    res.json(demoProducts);
};

// @desc    Calculate Profitability
// @route   POST /api/v1/xray/profit-calculator
exports.calculateProfit = async (req, res) => {
    try {
        const result = calculateProfitability(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};