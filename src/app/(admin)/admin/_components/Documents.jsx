import { DOC_KINDS } from "@/lib/admin/constants";
import { fmtDate } from "@/lib/admin/format";
import { uploadDocument, deleteDocument } from "../(app)/documents/actions";

const kindLabel = Object.fromEntries(DOC_KINDS);

// Document list + upload form for a client or booking. Files open through a short-lived link.
export default function Documents({ docs, clientId, bookingId }) {
  return (
    <div className="adm-card">
      <h2>Documents</h2>
      <p className="adm-sub">Stored privately. Passports and visas are sensitive: only upload what you need for the trip.</p>
      {!docs?.length ? <p className="adm-empty">No documents uploaded.</p> : (
        <ul className="rows">
          {docs.map((d) => (
            <li key={d.id}>
              <div><a href={`/admin/documents/${d.id}`} target="_blank" rel="noreferrer"><b>{d.filename}</b></a><small>{kindLabel[d.kind] || d.kind} · {fmtDate(d.created_at)}{d.sensitive ? " · sensitive" : ""}</small></div>
              <div className="r"><form action={deleteDocument}><input type="hidden" name="id" value={d.id} /><button className="adm-chip">Delete</button></form></div>
            </li>
          ))}
        </ul>
      )}
      <form className="adm-form" action={uploadDocument} encType="multipart/form-data">
        <input type="hidden" name="client_id" value={clientId} />
        {bookingId ? <input type="hidden" name="booking_id" value={bookingId} /> : null}
        <div className="adm-row2">
          <label className="adm-field"><span>Type</span><select name="kind">{DOC_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="adm-field"><span>File (PDF, JPG, PNG or WebP, up to 10 MB)</span><input type="file" name="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /></label>
        </div>
        <button className="adm-btn inline">Upload</button>
      </form>
    </div>
  );
}
