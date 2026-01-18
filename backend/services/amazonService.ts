/**
 * REAL BACKEND SERVICE
 * Handles the logic for estimating sales and fees.
 */

interface RawProduct {
  asin: string;
  title: string;
  price: number;
  bsr: number;
  category: string;
}

export const analyzeSearchPage = async (products: RawProduct[]) => {
  // In a real production environment, we might use a DB lookup here
  // or call an external Keepa/SP-API.
  
  return products.map(p => {
    const estimatedSales = calculateSalesFromBSR(p.bsr, p.category);
    
    return {
      ...p,
      estSales: estimatedSales,
      revenue: Math.round(estimatedSales * p.price),
      fees: calculateFBAFees(p.price),
      profit: (p.price - calculateFBAFees(p.price) - (p.price * 0.15)).toFixed(2)
    };
  });
};

const calculateSalesFromBSR = (bsr: number, category: string) => {
  if (!bsr || bsr === 0) return 0;
  // Proprietary algorithm simulation
  if (bsr < 100) return 5000;
  if (bsr < 1000) return 1500;
  if (bsr < 10000) return 300;
  if (bsr < 50000) return 50;
  return 10;
};

const calculateFBAFees = (price: number) => {
  const referral = price * 0.15;
  const fulfillment = 5.40; 
  return Number((referral + fulfillment).toFixed(2));
};
