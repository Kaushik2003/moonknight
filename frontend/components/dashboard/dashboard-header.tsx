'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { DashboardFilters, DateRange } from '@/lib/dashboard/types';

interface DashboardHeaderProps {
    title: string;
    onFiltersChange?: (filters: DashboardFilters) => void;
    defaultDateRange?: DateRange;
}

const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Japan'];
const cohorts = ['onboarding', 'beta', 'production', 'enterprise'];
const models = ['GPT-4', 'Claude-3', 'Codex', 'Llama-2'];

export function DashboardHeader({
    title,
    onFiltersChange,
    defaultDateRange
}: DashboardHeaderProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [dateFrom, setDateFrom] = useState<string>(
        defaultDateRange?.from.toISOString().split('T')[0] ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [dateTo, setDateTo] = useState<string>(
        defaultDateRange?.to.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0]
    );
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);

    const handleApplyFilters = () => {
        if (onFiltersChange) {
            onFiltersChange({
                dateRange: {
                    from: new Date(dateFrom),
                    to: new Date(dateTo),
                },
                countries: selectedCountries,
                cohorts: selectedCohorts,
                models: selectedModels,
            });
        }
    };

    const handleReset = () => {
        setDateFrom(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setDateTo(new Date().toISOString().split('T')[0]);
        setSelectedCountries([]);
        setSelectedCohorts([]);
        setSelectedModels([]);
    };

    const toggleCountry = (country: string) => {
        setSelectedCountries(
            selectedCountries.includes(country)
                ? selectedCountries.filter((c) => c !== country)
                : [...selectedCountries, country]
        );
    };

    const toggleCohort = (cohort: string) => {
        setSelectedCohorts(
            selectedCohorts.includes(cohort)
                ? selectedCohorts.filter((c) => c !== cohort)
                : [...selectedCohorts, cohort]
        );
    };

    const toggleModel = (model: string) => {
        setSelectedModels(
            selectedModels.includes(model)
                ? selectedModels.filter((m) => m !== model)
                : [...selectedModels, model]
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-border/50"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </div>

            {showFilters && (
                <Card className="p-4 bg-card/50 border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Date Range */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="text-sm px-2 py-1 bg-background border border-border/50 rounded text-foreground w-full"
                                    />
                                </div>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="text-sm px-2 py-1 bg-background border border-border/50 rounded text-foreground w-full"
                                />
                            </div>
                        </div>

                        {/* Countries */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Countries</label>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {countries.map((country) => (
                                    <label key={country} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedCountries.includes(country)}
                                            onChange={() => toggleCountry(country)}
                                            className="h-4 w-4 rounded border-border/50 bg-background"
                                        />
                                        <span className="text-sm text-muted-foreground">{country}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Cohorts */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Cohorts</label>
                            <div className="space-y-1">
                                {cohorts.map((cohort) => (
                                    <label key={cohort} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedCohorts.includes(cohort)}
                                            onChange={() => toggleCohort(cohort)}
                                            className="h-4 w-4 rounded border-border/50 bg-background"
                                        />
                                        <span className="text-sm text-muted-foreground capitalize">{cohort}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Models */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Models</label>
                            <div className="space-y-1">
                                {models.map((model) => (
                                    <label key={model} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedModels.includes(model)}
                                            onChange={() => toggleModel(model)}
                                            className="h-4 w-4 rounded border-border/50 bg-background"
                                        />
                                        <span className="text-sm text-muted-foreground">{model}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                        <Button
                            size="sm"
                            onClick={handleApplyFilters}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Apply Filters
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="border-border/50"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
