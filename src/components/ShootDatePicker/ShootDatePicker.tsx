import { ShootDatePickerProps } from "@/typing/interfaces";
import DatePicker from "react-datepicker";
import CalendarIcon from "@/assets/icons/CalendarIcon";
import "react-datepicker/dist/react-datepicker.css";
import "./ShootDatePicker.scss";

const ShootDatePicker = ({ shootDate, setShootDate, className, rawDate }: ShootDatePickerProps) => {
  
  const handleChange = (date: Date | null) => {
    setShootDate(date);
  };

  return (
    <div className="shootDatePicker">
      <DatePicker
        selected={rawDate? rawDate : shootDate}
        onChange={handleChange}
        className="shootDatePicker__selector"
        dateFormat="MM/dd/yyyy"
        placeholderText="Select a date"
      />
      <div className="shootDatePicker__icon-container">
        <CalendarIcon className={className} />
      </div>
    </div>
  );
};

export default ShootDatePicker;