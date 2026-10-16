import Icon from "./Icon";

// Homepage sections for content managed in the admin area. Each one only appears when there is published content,
// so the site looks exactly as before until you add something.
export default function ContentSections({ faqs = [], testimonials = [] }) {
  const ld = faqs.length
    ? JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }).replace(/</g, "\\u003c")
    : null;
  return (
    <>
      {testimonials.length ? (
        <section className="sec" id="reviews">
          <div className="wrap">
            <p className="eyebrow dark">Kind words</p>
            <h2>What our travellers say</h2>
            <div className="quotes">
              {testimonials.map((t) => (
                <figure className="quote" key={t.id}>
                  {t.rating ? <div className="stars" aria-label={`${t.rating} out of 5 stars`}>{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div> : null}
                  <blockquote>{t.quote}</blockquote>
                  <figcaption><b>{t.author}</b>{t.detail ? <span>{t.detail}</span> : null}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {faqs.length ? (
        <section className="sec alt" id="faq">
          <div className="wrap">
            <p className="eyebrow dark">Good to know</p>
            <h2>Frequently asked questions</h2>
            <div className="faqs">
              {faqs.map((f) => (
                <details key={f.id}>
                  <summary>{f.question}<Icon name="plus" size={16} /></summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
          </div>
        </section>
      ) : null}
    </>
  );
}
