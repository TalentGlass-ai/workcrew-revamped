import Image from "next/image";

type LogoProps = {
  src: string;        
  alt: string;
  width?: number;     
  height?: number;
  className?: string;
};

export default function Logo({
  src,
  alt,
  width = 140,
  height = 40,
  className,
}: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ objectFit: "contain" }}
      priority={false}
      sizes="(max-width: 640px) 96px, (max-width: 1024px) 120px, 140px"
    />
  );
}
