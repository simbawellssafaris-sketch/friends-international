import { CURRENCIES } from "@/lib/admin/constants";

// The booking form fields, shared by "New booking" and the edit form on a booking.
export default function BookingFields({ b = {}, statuses }) {
  const v = (k, d = "") => (b[k] ?? d);
  return (
    <>
      <label className="adm-field"><span>Trip / service booked</span><input name="title" required maxLength={200} defaultValue={v("title")} /></label>
      <div className="adm-row2">
        <label className="adm-field"><span>Destination</span><input name="destination" maxLength={200} defaultValue={v("destination")} /></label>
        <label className="adm-field"><span>Status</span>
          <select name="status" defaultValue={v("status", "enquiry")}>{statuses.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}</select>
        </label>
      </div>
      <div className="adm-row2">
        <label className="adm-field"><span>Arrival / start date</span><input type="date" name="start_date" defaultValue={v("start_date")} /></label>
        <label className="adm-field"><span>Departure / end date</span><input type="date" name="end_date" defaultValue={v("end_date")} /></label>
      </div>
      <div className="adm-row2">
        <label className="adm-field"><span>Adults</span><input type="number" name="adults" min="1" max="50" defaultValue={v("adults", 1)} /></label>
        <label className="adm-field"><span>Children</span><input type="number" name="children" min="0" max="30" defaultValue={v("children", 0)} /></label>
      </div>
      <label className="adm-field"><span>Accommodation</span><textarea name="accommodation" rows={2} maxLength={2000} defaultValue={v("accommodation")} /></label>
      <label className="adm-field"><span>Transport</span><textarea name="transport" rows={2} maxLength={2000} defaultValue={v("transport")} /></label>
      <label className="adm-field"><span>Guide or supplier</span><input name="guide_or_supplier" maxLength={300} defaultValue={v("guide_or_supplier")} /></label>
      <div className="adm-row2">
        <label className="adm-field"><span>Currency</span><select name="currency" defaultValue={v("currency", "USD")}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="adm-field"><span>Quoted price</span><input name="quoted_total" inputMode="decimal" defaultValue={v("quoted_total")} /></label>
      </div>
      <div className="adm-row2">
        <label className="adm-field"><span>Agreed price</span><input name="agreed_total" inputMode="decimal" defaultValue={v("agreed_total")} /></label>
        <label className="adm-field"><span>Deposit required</span><input name="deposit_required" inputMode="decimal" defaultValue={v("deposit_required", 0)} /></label>
      </div>
      <label className="adm-field"><span>Payment deadline</span><input type="date" name="payment_deadline" defaultValue={v("payment_deadline")} /></label>
      <label className="adm-field"><span>Private notes</span><textarea name="notes" rows={3} maxLength={4000} defaultValue={v("notes")} /></label>
    </>
  );
}
