import Link from "next/link";

export default function DesktopNotSupported() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Mobile Device Required</h1>
        <p className="mb-8">
          HyperSpace Scanner requires a mobile device with a camera to function properly.
          Please access this experience from a smartphone or tablet.
        </p>
        <Link 
          href="/" 
          className="px-6 py-2 bg-[#a701b8] rounded-lg hover:bg-[#8a0198] transition-colors duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 