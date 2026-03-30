'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DataTableProps {
    title: string;
    columns: {
        key: string;
        label: string;
        sortable?: boolean;
        format?: (value: any) => string;
    }[];
    data: Record<string, any>[];
    rowsPerPage?: number;
}

export function DataTable({
    title,
    columns,
    data,
    rowsPerPage = 10,
}: DataTableProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
        setCurrentPage(0);
    };

    let sortedData = [...data];
    if (sortKey) {
        sortedData.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return sortOrder === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const paginatedData = sortedData.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
    );

    return (
        <Card className="bg-card/50 border-border/50 p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/50">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="text-left px-4 py-3 font-medium text-muted-foreground text-sm"
                                >
                                    <button
                                        className={`flex items-center gap-2 ${column.sortable ? 'cursor-pointer hover:text-foreground' : ''
                                            }`}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        {column.label}
                                        {column.sortable && sortKey === column.key && (
                                            sortOrder === 'asc' ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )
                                        )}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <tr key={idx} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-3 text-sm text-foreground"
                                    >
                                        {column.format
                                            ? column.format(row[column.key])
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage + 1} of {totalPages} ({sortedData.length} total)
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="border-border/50"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="border-border/50"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
