import Breadcrumbs from './Breadcrumbs';
import SeoJsonLd from './SeoJsonLd';

const SectionShell = ({ breadcrumbs = [], schema = null, children }) => {
  return (
    <>
      {schema ? <SeoJsonLd data={schema} /> : null}
      {breadcrumbs.length > 0 ? (
        <div className="border-b border-border/50 bg-surface/20">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      ) : null}
      {children}
    </>
  );
};

export default SectionShell;

