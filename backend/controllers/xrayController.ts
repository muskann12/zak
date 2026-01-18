import { Request, Response } from 'express';
import { analyzeSearchPage } from '../services/amazonService';

export const analyzeProducts = async (req: Request, res: Response) => {
    try {
        const { rawItems } = req.body;

        if (!rawItems || !Array.isArray(rawItems)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        const data = await analyzeSearchPage(rawItems);
        res.json({ success: true, data });

    } catch (error) {
        console.error("Xray Controller Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
