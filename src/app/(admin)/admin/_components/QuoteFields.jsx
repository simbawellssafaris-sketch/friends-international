// Text fields of a quotation (title, validity, inclusions, exclusions, terms). Used by "new" and by the draft editor.
export default function QuoteFields({ q = {} }) {
  const v = (k) => q[k] ?? "";
  return (
    <>
      <label className="adm-field"><span>Quotation title</span><input name="title" required maxLength={200} defaultValue={v("title")} placeholder="e.g. 7-day Maasai Mara and Amboseli safari for 2" /></label>
      <label className="adm-field"><span>Valid until</span><input type="date" name="valid_until" defaultValue={v("valid_until")} /></label>
      <label className="adm-field"><span>What is included</span><textarea name="inclusions" rows={4} maxLength={6000} defaultValue={v("inclusions")} placeholder="One item per line" /></label>
      <label className="adm-field"><span>What is not included</span><textarea name="exclusions" rows={4} maxLength={6000} defaultValue={v("exclusions")} placeholder="One item per line" /></label>
      <label className="adm-field"><span>Payment terms</span><textarea name="payment_terms" rows={3} maxLength={3000} defaultValue={v("payment_terms")} placeholder="e.g. 30% deposit to confirm, balance 45 days before arrival" /></label>
      <label className="adm-field"><span>Cancellation terms</span><textarea name="cancellation_terms" rows={3} maxLength={3000} defaultValue={v("cancellation_terms")} /></label>
      <label className="adm-field"><span>Internal notes (never shown to the client)</span><textarea name="notes" rows={2} maxLength={3000} defaultValue={v("notes")} /></label>
    </>
  );
}
