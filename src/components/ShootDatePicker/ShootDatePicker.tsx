import DatePicker from "react-datepicker";
import CalendarIcon from "@/assets/icons/CalendarIcon";
import "react-datepicker/dist/react-datepicker.css";
import "./ShootDatePicker.scss";

interface ShootDatePickerProps {
  shootDate: Date | null;
  setShootDate: (date: Date | null) => void;
  className?: string;
  rawDate?: Date | null;
};

const ShootDatePicker = ({ shootDate, setShootDate, className, rawDate }: ShootDatePickerProps) => {
  
  const handleChange = (date: Date | null) => {
    setShootDate(date);
  };

  return (
    <div className="shootDatePicker">

      <DatePicker
        selected={rawDate
          ? rawDate
          : shootDate}
        onChange={handleChange}
        className="shootDatePicker__selector"
        dateFormat="MM/dd/yyyy"
        // placeholderText={newShootDate ? "Select a date" : newShootDate}
        placeholderText={shootDate ? "Select a date" : undefined}
      />
      <div className="shootDatePicker__icon-container">
        <CalendarIcon 
          className={className}
        />
      </div>
    </div>
  );
};

export default ShootDatePicker;