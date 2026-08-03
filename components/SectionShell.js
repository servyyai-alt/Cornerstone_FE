// This component is used to wrap sections of a page and provide optional breadcrumbs and schema data for SEO purposes.

// import Breadcrumbs from './Breadcrumbs';
// import SeoJsonLd from './SeoJsonLd';

// const SectionShell = ({ breadcrumbs = [], schema = null, children }) => {
//   return (
//     <>
//       {schema ? <SeoJsonLd data={schema} /> : null}
//       {breadcrumbs.length > 0 ? (
//         <div className="border-b border-border/50 bg-surface/20">
//           <Breadcrumbs items={breadcrumbs} />
//         </div>
//       ) : null}
//       {children}
//     </>
//   );
// };

// export default SectionShell;

// IF you want to use the SectionShell component without breadcrumbs, you can use the following code:

import SeoJsonLd from './SeoJsonLd';

const SectionShell = ({ schema = null, children }) => {
  return (
    <>
      {schema ? <SeoJsonLd data={schema} /> : null}
      {children}
    </>
  );
};

export default SectionShell;


