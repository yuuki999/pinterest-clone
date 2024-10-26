import { useState, useEffect } from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../shadcn/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/ui/select";
import { ControllerRenderProps } from "react-hook-form";

interface BirthdaySelectorProps {
  field: ControllerRenderProps;
}

const BirthdaySelector = ({ field }: BirthdaySelectorProps) => {
  const [date, setDate] = useState<{
    year: string;
    month: string;
    day: string;
  }>({
    year: "",
    month: "",
    day: "",
  });

  const maxYear = new Date().getFullYear() - 13;
  const years = Array.from({ length: maxYear - 1900 + 1 }, (_, i) => maxYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 選択された年月に基づいて、その月の日数を計算
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
    return Array.from(
      { length: new Date(parseInt(year), parseInt(month), 0).getDate() },
      (_, i) => i + 1
    );
  };

  // 日付が変更されたときにフォームの値を更新
  useEffect(() => {
    if (date.year && date.month && date.day) {
      const dateObj = new Date(
        parseInt(date.year),
        parseInt(date.month) - 1,
        parseInt(date.day)
      );
      field.onChange(dateObj.toISOString());
    }
  }, [date, field]);

  // 初期値があれば設定
  useEffect(() => {
    if (field.value) {
      const dateObj = new Date(field.value);
      setDate({
        year: dateObj.getFullYear().toString(),
        month: (dateObj.getMonth() + 1).toString(),
        day: dateObj.getDate().toString(),
      });
    }
  }, [field.value]);

  const handleChange = (value: string, type: 'year' | 'month' | 'day') => {
    const newDate = { ...date, [type]: value };
    
    // 月が変更されて、選択されている日が新しい月の日数を超える場合は日をリセット
    if (type === 'month' || type === 'year') {
      const daysInMonth = getDaysInMonth(newDate.year, newDate.month);
      if (parseInt(newDate.day) > daysInMonth.length) {
        newDate.day = '';
      }
    }
    
    setDate(newDate);
  };

  return (
    <FormItem className="flex flex-col space-y-2">
      <FormLabel>生年月日</FormLabel>
      <FormControl>
        <div className="flex gap-4">
          <Select
            value={date.year}
            onValueChange={(value) => handleChange(value, 'year')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="年" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={date.month}
            onValueChange={(value) => handleChange(value, 'month')}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="月" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {month}月
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={date.day}
            onValueChange={(value) => handleChange(value, 'day')}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="日" />
            </SelectTrigger>
            <SelectContent>
              {getDaysInMonth(date.year, date.month).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}日
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default BirthdaySelector;
