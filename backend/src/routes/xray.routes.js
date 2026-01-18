const express = require('express');
const router = express.Router();
const sendResponse = require('../utils/sendResponse');

// Get Demo Data
router.get('/demo-data', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    
    // Generates realistic niche data (e.g., "Kitchen & Dining" - Wood Cutting Boards)
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
            if (type === 'bsr') {
                if (current < 1) current = 1;
                if (Math.random() > 0.8) current = current * 0.8; 
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
        const rating = Number((3.5 + (Math.random() * 1.5)).toFixed(1));
        const reviewCount = Math.floor(50 + Math.random() * 5000);
        const bsr = Math.floor(100 + Math.random() * 15000);
        
        const estSales = Math.floor(300000 / (bsr + 1000) * (rating / 3)); 
        const revenue = estSales * price;
        const fees = price * 0.15 + 4.50;

        return {
            id: i + 1, // Keep ID for compatibility/uniqueness
            asin: `B0${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            title: title,
            price: price,
            revenue: Number(revenue.toFixed(2)),
            fees: Number(fees.toFixed(2)),
            rating: rating,
            reviewCount: reviewCount,
            // URL encode the title for the placeholder text to avoid broken images
            imgUrl: `https://placehold.co/50/orange/white?text=${encodeURIComponent(title.substring(0,2).toUpperCase())}`, 
            estSales: Number(estSales.toFixed(0)),
            bsr: bsr,
            brand: brand,
            sellerType: Math.random() > 0.3 ? "FBA" : "AMZ",
            lqs: Math.floor(5 + Math.random() * 5),
            priceHistory: generateHistory(price, 1, 'price'),
            bsrHistory: generateHistory(bsr, bsr * 0.05, 'bsr'),
            reviewVelocity: Math.floor(Math.random() * 50)
        };
    });

    return sendResponse(res, 200, true, 'Demo data retrieved', demoProducts);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Failed to fetch demo data');
  }
});

// Profit Calculator Route
router.post('/profit-calculator', async (req, res) => {
    try {
        const { sellPrice, costPrice, quantity, fbaFees, referralFeePct } = req.body;
        
        const refFee = sellPrice * (referralFeePct / 100);
        const totalFees = (fbaFees + refFee);
        const profitPerUnit = sellPrice - costPrice - totalFees;
        const totalProfit = profitPerUnit * quantity;
        const margin = (profitPerUnit / sellPrice) * 100;
        const roi = (profitPerUnit / costPrice) * 100;

        return res.json({
            refFee: Number(refFee.toFixed(2)),
            totalFees: Number(totalFees.toFixed(2)),
            profitPerUnit: Number(profitPerUnit.toFixed(2)),
            totalProfit: Number(totalProfit.toFixed(2)),
            margin: Number(margin.toFixed(1)),
            roi: Number(roi.toFixed(1))
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Calculation failed" });
    }
});


// Analyze Products (Extension)
router.post('/analyze', async (req, res) => {
  try {
    const { rawItems } = req.body; // Expects array of { asin, title, price, bsr }

    if (!rawItems || !Array.isArray(rawItems)) {
        return sendResponse(res, 400, false, 'Invalid items');
    }

    // Mock logic: Calculate Revenue based on BSR
    // Real logic would query a historical database or API
    const analyzedItems = rawItems.map(item => {
        // Simple mock formula: Lower BSR = Higher Sales
        // Max sales (BSR 1) = 3000 units/mo
        // Min sales (BSR 50000) = 10 units/mo
        const estimatedSales = Math.max(10, Math.round(3000 * Math.exp(-0.0001 * item.bsr))); 
        const revenue = Math.round(estimatedSales * item.price);

        return {
            ...item,
            estimatedSales,
            revenue
        };
    });

    return sendResponse(res, 200, true, 'Analysis complete', analyzedItems);

  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
});

module.exports = router;
