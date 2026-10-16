// Fixed set of messages, chosen by a short code in the address (?ok=saved). Nothing from the URL is shown as-is.
const OK = {
  saved: "Saved.", noted: "Note added.", archived: "Archived.", restored: "Restored.", converted: "Converted to a booking.",
  created: "Created.", published: "Published. Visitors can see it now.", sent: "Sent.", paid: "Payment recorded.", deleted: "Removed.", retried: "Email sent.", uploaded: "File uploaded.",
};
const ERR = {
  invalid: "Please check the highlighted details and try again.",
  failed: "That did not work. Nothing was changed. Please try again.",
  duplicate: "That looks like a duplicate of an existing record, so it was not saved again.",
  currency: "The payment currency must match the booking currency.",
  notfound: "That record could not be found.",
  mail: "The email could not be sent. The record is saved; you can retry from the page.",
};

export default function Flash({ ok, err }) {
  if (ERR[err]) return <div className="adm-alert err" role="alert">{ERR[err]}</div>;
  if (OK[ok]) return <div className="adm-alert ok" role="status">{OK[ok]}</div>;
  return null;
}
