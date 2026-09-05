import Link from "next/link";
import { CategoryQuoteButton } from "@/components/CategoryQuoteButton";
import { absoluteUrl } from "@/lib/seo";

export function CategoryGuide({ guide, category, products, categories, articles }) {
  const related = guide.related.filter((item) => categories.some((category) => category.slug === item.slug));
  const guides = articles.filter((article) => new RegExp(guide.articlePattern, "i").test(article.title)).slice(0, 3);
  return (
    <div className="category-guide" id="selection-guide">
      <section className="category-guide-section" aria-labelledby="selection-heading">
        <div className="category-guide-lead">
          <p className="eyebrow">SELECTION GUIDE</p>
          <h2 id="selection-heading">{guide.heading}</h2>
          <p>{guide.overview}</p>
        </div>
        <div className="category-guide-steps">
          {guide.steps.map(([title, text], index) => <article key={title}>
            <span className="category-step-number">0{index + 1}</span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </article>)}
        </div>
      </section>

      {products.length > 0 && <section className="category-guide-section category-comparison" aria-labelledby="compare-heading">
        <p className="eyebrow">PRODUCT COMPARISON</p>
        <h2 id="compare-heading">Compare the models on this page.</h2>
        <p>Use the listed specifications to shortlist a starting point. Open the product page for the full configuration and confirm any unlisted requirement with us.</p>
        <div className="category-table-scroll" role="region" aria-label="Product specification comparison, scroll horizontally" tabIndex={0}>
          <table>
            <caption className="sr-only">Listed specifications for {category.name}</caption>
            <thead><tr><th scope="col">Product / model</th>{guide.columns.map((column) => <th scope="col" key={column.title}>{column.title}</th>)}</tr></thead>
            <tbody>{products.map((product) => <tr key={product.id}>
              <th scope="row"><Link href={`/products/${product.slug}`}>{product.name}</Link>{product.modelNumber && <span>{product.modelNumber}</span>}</th>
              {guide.columns.map((column) => {
                const specs = product.specifications?.filter((spec) => new RegExp(column.pattern, "i").test(spec.label)) || [];
                return <td key={column.title}>{specs.length ? specs.map((spec) => <span key={spec.id || spec.label}>{spec.label}: {spec.value}</span>) : "Confirm with us"}</td>;
              })}
            </tr>)}</tbody>
          </table>
        </div>
      </section>}

      <section className="category-guide-section category-guide-pair" aria-label="Application and customization guidance">
        <div><p className="eyebrow">APPLICATION FIT</p><h2>Match the hardware to the job.</h2><p>{guide.applications}</p><Link href="/solutions">Explore RF control applications ↗</Link></div>
        <div><p className="eyebrow">OEM & CUSTOMIZATION</p><h2>Define the sample before the order.</h2><p>{guide.customization}</p><Link href="/#capabilities">See our customization capabilities ↗</Link></div>
      </section>

      <section className="category-guide-section category-guide-faq" aria-labelledby="questions-heading">
        <p className="eyebrow">BEFORE YOU SPECIFY</p><h2 id="questions-heading">Common selection questions.</h2>
        {guide.questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>

      <section className="category-guide-section category-guide-pair" aria-label="Related products and technical reading">
        <div><p className="eyebrow">COMPLETE THE SYSTEM</p><h2>Find the other half of the link.</h2><div className="category-guide-links">{related.map((item) => <Link key={item.slug} href={`/products/category/${item.slug}`}>{item.label}<span aria-hidden="true">↗</span></Link>)}</div></div>
        <div><p className="eyebrow">TECHNICAL READING</p><h2>Work through the details.</h2><div className="category-guide-links">{guides.map((article) => <Link key={article.slug} href={`/knowledge/${article.slug}`}>{article.title}<span aria-hidden="true">↗</span></Link>)}<Link href="/knowledge/category/selection-guides">Browse RF selection guides<span aria-hidden="true">↗</span></Link></div></div>
      </section>

      <section className="category-guide-quote" aria-labelledby="category-quote-heading">
        <div><p className="eyebrow">LET’S SPECIFY YOUR SYSTEM</p><h2 id="category-quote-heading">Bring the requirements. We’ll help narrow the options.</h2><p>A clear starting brief makes the first configuration easier to review.</p><CategoryQuoteButton categoryName={category.name} categoryUrl={absoluteUrl(`/products/category/${category.slug}`)} fields={guide.fields} /></div>
        <div><h3>Include in your request</h3><ul>{guide.fields.map((field) => <li key={field}>{field}</li>)}</ul></div>
      </section>
    </div>
  );
}
