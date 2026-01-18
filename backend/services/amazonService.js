/**
 * Calculates profitability metrics based on costs and fees.
 */
const calculateProfitability = ({ sellPrice, costPrice, quantity, fbaFees, referralFeePct }) => {
    const sPrice = Number(sellPrice) || 0;
    const cPrice = Number(costPrice) || 0;
    const qty = Number(quantity) || 1;
    const fFees = Number(fbaFees) || 0;
    const rFeePct = Number(referralFeePct) || 15;

    const refFee = (sPrice * (rFeePct / 100));
    const totalFees = fFees + refFee;
    const profitPerUnit = sPrice - cPrice - totalFees;
    const totalProfit = profitPerUnit * qty;
    
    const margin = sPrice > 0 ? (profitPerUnit / sPrice) * 100 : 0;
    const roi = cPrice > 0 ? (profitPerUnit / cPrice) * 100 : 0;

    return {
        refFee: Number(refFee.toFixed(2)),
        totalFees: Number(totalFees.toFixed(2)),
        profitPerUnit: Number(profitPerUnit.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        margin: Number(margin.toFixed(2)),
        roi: Number(roi.toFixed(2))
    };
};

/**
 * Estimates sales and revenue based on Best Seller Rank (BSR) and Category.
 */
const estimateSales = (bsr, category) => {
    if (!bsr) return 0;
    // Simple tiered estimation logic for demo purposes
    // In production, this would query a historical database or external API
    if (bsr < 100) return 5000;
    if (bsr < 1000) return 1500;
    if (bsr < 5000) return 800;
    if (bsr < 10000) return 300;
    if (bsr < 50000) return 50;
    return 10;
};

const calculateFBAFees = (price) => {
    // Rough estimation: 15% referral + fixed fulfillment cost
    return Number((price * 0.15 + 5.40).toFixed(2));
};

module.exports = { calculateProfitability, estimateSales, calculateFBAFees };