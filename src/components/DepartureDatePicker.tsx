'use client';

import { format, startOfToday, isBefore } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { ChangeEvent, ChangeEventHandler } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DepartureDatePickerProps {
  label?: string;
  placeholder?: string;
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (dateString: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function DepartureDatePicker({
  label = 'Departure Date',
  placeholder = 'Pick a date',
  value,
  onChange,
  disabled = false,
  className,
}: DepartureDatePickerProps) {
  const today = startOfToday();

  // Parse value to Date object
  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const [month, setMonth] = useState<Date>(selectedDate || today);
  const [open, setOpen] = useState(false);

  // Sync month view when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [selectedDate]);

  const handleCalendarChange = (newValue: string | number, event: ChangeEventHandler<HTMLSelectElement>) => {
    const newEvent = {
      target: {
        value: String(newValue),
      },
    } as ChangeEvent<HTMLSelectElement>;
    event(newEvent);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format as YYYY-MM-DD for API compatibility
      const formatted = format(date, 'yyyy-MM-dd');
      onChange(formatted);
    } else {
      onChange('');
    }
    setOpen(false);
  };

  // Disable past dates
  const disabledDays = (date: Date) => {
    return isBefore(date, today);
  };

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            captionLayout="dropdown"
            components={{
              MonthCaption: (props) => <>{props.children}</>,
              DropdownNav: (props) => <div className="flex w-full items-center gap-2">{props.children}</div>,
              Dropdown: (props) => (
                <Select
                  onValueChange={(newValue) => {
                    if (props.onChange) {
                      handleCalendarChange(newValue, props.onChange);
                    }
                  }}
                  value={String(props.value)}
                >
                  <SelectTrigger className="first:flex-1 last:shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {props.options?.map((option) => (
                      <SelectItem disabled={option.disabled} key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            }}
            hideNavigation
            mode="single"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateSelect}
            selected={selectedDate}
            disabled={disabledDays}
            fromDate={today}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
