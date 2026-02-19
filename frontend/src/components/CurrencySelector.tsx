"use client";

import { useCurrency, Currency } from "@/context/CurrencyContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DollarSign, Euro, PoundSterling, Coins } from "lucide-react";

export default function CurrencySelector() {
    const { currency, setCurrency } = useCurrency();

    const getIcon = (c: Currency) => {
        switch (c) {
            case "USD": return <DollarSign className="h-4 w-4" />;
            case "EUR": return <Euro className="h-4 w-4" />;
            case "GBP": return <PoundSterling className="h-4 w-4" />;
            default: return <Coins className="h-4 w-4" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                    {getIcon(currency)}
                    <span className="font-bold">{currency}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCurrency("USD")}>🇺🇸 USD ($)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("EUR")}>🇪🇺 EUR (€)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("GBP")}>🇬🇧 GBP (£)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("AED")}>🇦🇪 AED (د.إ)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("LBP")}>🇱🇧 LBP (ل.ل)</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
