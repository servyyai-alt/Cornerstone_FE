const safeJsonStringify = (value) =>
  JSON.stringify(value).replace(/</g, '\\u003c');

const SeoJsonLd = ({ data }) => {
  if (!data) return null;

  const payload = Array.isArray(data) ? data : [data];

  return payload.map((item, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonStringify(item) }}
    />
  ));
};

export default SeoJsonLd;

