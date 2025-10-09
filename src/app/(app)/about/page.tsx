import Image from "next/image";

export default function Home() {
  return (
    <div className="prose">
      <Image alt="eeviriyi" height={96} src="/avatar.png" width={64} />
      <p>I'm Eeviriyi.</p>
    </div>
  );
}
