import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Available Sundarban species
const SUNDARBAN_SPECIES = [
    'Royal Bengal Tiger',
    'Saltwater Crocodile',
    'Ganges River Dolphin',
    'Water Monitor Lizard',
    'Spotted Deer'
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { species } = body;

        if (!species) {
            return NextResponse.json(
                { error: 'Species name is required' },
                { status: 400 }
            );
        }

        const forecastPath = path.join(process.cwd(), 'backend', 'ml_models', 'wildlife_forecast.json');

        if (!fs.existsSync(forecastPath)) {
            return NextResponse.json(
                { error: 'Forecasting model data not found. Please run the ML training script.' },
                { status: 404 }
            );
        }

        const allForecasts = JSON.parse(fs.readFileSync(forecastPath, 'utf-8'));
        const speciesForecast = allForecasts[species];

        if (!speciesForecast) {
            return NextResponse.json(
                { error: `No forecast available for ${species}` },
                { status: 404 }
            );
        }

        // Transform LSTM output to the format expected by the frontend
        const result = {
            current_population: speciesForecast.historical.population[speciesForecast.historical.population.length - 1],
            trend: speciesForecast.risk_score > 0.6 ? 'declining' : (speciesForecast.risk_score < 0.3 ? 'increasing' : 'stable'),
            forecast: speciesForecast.forecast.years.map((year: number, i: number) => ({
                month: `${year}`,
                predicted_population: Math.round(speciesForecast.forecast.population[i]),
                lower_bound: Math.round(speciesForecast.forecast.population[i] * 0.9),
                upper_bound: Math.round(speciesForecast.forecast.population[i] * 1.1)
            })),
            risk_score: speciesForecast.risk_score,
            predicted_category: speciesForecast.predicted_category,
            confidence: speciesForecast.confidence_interval,
            evaluation: speciesForecast.evaluation,
            // Additional population forecast information
            population_info: {
                current_population: speciesForecast.historical.population[speciesForecast.historical.population.length - 1],
                min_historical: Math.min(...speciesForecast.historical.population),
                max_historical: Math.max(...speciesForecast.historical.population),
                avg_growth_rate: (speciesForecast.historical.population[speciesForecast.historical.population.length - 1] - speciesForecast.historical.population[0]) / speciesForecast.historical.population[0],
                projected_2034_population: Math.round(speciesForecast.forecast.population[speciesForecast.forecast.population.length - 1]),
                population_change_percent: (((speciesForecast.forecast.population[speciesForecast.forecast.population.length - 1] - speciesForecast.historical.population[speciesForecast.historical.population.length - 1]) / speciesForecast.historical.population[speciesForecast.historical.population.length - 1]) * 100).toFixed(1)
            },
            habitat_info: {
                current_stress: (speciesForecast.historical.stress[speciesForecast.historical.stress.length - 1] * 100).toFixed(1),
                current_anthropogenic_pressure: (speciesForecast.historical.anthropogenic[speciesForecast.historical.anthropogenic.length - 1] * 100).toFixed(1),
                stress_trend: speciesForecast.forecast.stress[speciesForecast.forecast.stress.length - 1] > speciesForecast.historical.stress[speciesForecast.historical.stress.length - 1] ? 'increasing' : 'decreasing'
            },
            model_info: {
                model_type: 'Random Forest Regression',
                mae: speciesForecast.evaluation.mae.toFixed(2),
                rmse: speciesForecast.evaluation.rmse.toFixed(2),
                forecast_period: '10 years',
                last_updated: new Date().toISOString()
            }
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Population forecast error:', error);
        return NextResponse.json(
            { error: 'Failed to generate population forecast' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        available_species: SUNDARBAN_SPECIES,
        forecast_horizons: [12, 24, 60, 120], // Yearly horizons
        description: 'LSTM-based wildlife population forecasting for Sundarbans',
    });
}
