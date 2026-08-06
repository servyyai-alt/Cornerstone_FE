/* eslint-disable @next/next/no-img-element */
// CMS-provided images can originate from any host (uploads API, Cloudinary, etc.),
// so a native <img> wrapper with performance defaults is used instead of next/image,
// which requires per-host remotePatterns configuration.
const Img = ({
  src,
  alt = '',
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) => {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
};

export default Img;
