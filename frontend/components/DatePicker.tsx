import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatThaiDate, formatThaiYear, formatThaiDateDisplay, formatThaiMonthYear, getQuickDateOptions } from '@/lib/thaiDate';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  compact?: boolean; // โหมดกะทัดรัดสำหรับ mobile
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "เลือกวันที่",
  disabled = false,
  className = "",
  minDate,
  maxDate,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // แปลง string เป็น Date object
  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

  // จัดการการเลือกวันที่
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // แปลง Date เป็น YYYY-MM-DD string
      const formattedDate = format(date, 'yyyy-MM-dd');
      onChange(formattedDate);
      setIsOpen(false);
    }
  };

  // แปลงวันที่สำหรับแสดงผล (พ.ศ.)
  const displayDate = selectedDate 
    ? formatThaiDate(selectedDate)
    : placeholder;

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 px-3 py-2",
              "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              !selectedDate && "text-gray-500"
            )}
            disabled={disabled}
          >
            <Calendar className="mr-2 h-4 w-4 text-blue-600" />
            <span className="flex-1">
              {displayDate}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-lg border" align="start">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={th}
            fromDate={minDate}
            toDate={maxDate}
            showOutsideDays={false}
            className="p-3"
            formatters={{
              formatCaption: (date) => {
                // ใช้ formatThaiMonthYear ที่สร้างไว้
                return formatThaiMonthYear(date);
              }
            }}
            classNames={{
              months: "flex flex-col space-y-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-base font-semibold text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                "h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex mb-2",
              head_cell: "text-gray-500 rounded-md w-10 font-medium text-sm text-center",
              row: "flex w-full mt-1",
              cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: cn(
                "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                "h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              ),
              day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white font-semibold shadow-md",
              day_today: "bg-blue-100 text-blue-900 font-semibold",
              day_outside: "text-gray-300 hover:bg-gray-50",
              day_disabled: "text-gray-200 cursor-not-allowed hover:bg-transparent",
            }}
            components={{
              IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
              IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
            }}
          />
          
          {/* Quick Actions */}
          {!compact && (
            <div className="border-t bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-600 mb-3 text-center">
                เลือกด่วน
              </div>
              <div className="grid grid-cols-3 gap-2">
                {getQuickDateOptions().map((option) => (
                  <Button
                    key={option.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateSelect(option.date)}
                    className="text-xs h-auto py-2 px-2 flex flex-col items-center space-y-1 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">{option.label}</span>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      {option.description.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
