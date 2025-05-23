import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const DateTimePicker = ({
  label,
  value,
  onChange,
}: DateTimePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.showPicker();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative flex">
        <Input
          ref={inputRef}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value + ":00")}
          className={`
            pr-10
            [&::-webkit-calendar-picker-indicator]:opacity-0
            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:right-2
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
          `}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          <CalendarDays className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
