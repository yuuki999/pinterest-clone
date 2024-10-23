import { PinGrid } from "./components/PinGrid";
import { getPins } from "./libs/db";

export const revalidate = 0;

export default async function Home() {
  const { pins } = await getPins({ limit: 50 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PinGrid initialPins={pins} />
    </div>
  );
}
