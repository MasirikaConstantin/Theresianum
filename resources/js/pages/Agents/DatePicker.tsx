'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SelectSingleEventHandler } from 'react-day-picker';

interface DatePickerProps {
    selected?: Date | null;
    onChange: SelectSingleEventHandler;
    className?: string;
}

export function DatePicker({ selected, onChange, className }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !selected && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected ? (
                        format(selected, 'PP', { locale: fr })
                    ) : (
                        <span>Choisir une date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selected || undefined}
                    onSelect={onChange}
                    initialFocus
                    locale={fr}
                />
            </PopoverContent>
        </Popover>
    );
}