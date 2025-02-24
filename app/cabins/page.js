// import Counter from "@/app/_components/Counter";
// import Navigation from "../_components/Navigation";
// import CabinCard from "@/app/_components/CabinCard";
// import { getCabins } from "../_lib/data-service";

import { Suspense } from "react";
import CabinList from "../_components/CabinList";
import Spinner from "../_components/Spinner";
import Filter from "../_components/Filter";
import ReservationReminder from "../_components/ReservationReminder";

export const metadata = {
  title : 'Cabins'
}

// it refetch the data after the specified time 
export const revalidate = 3600

export default function Page({searchParams}) {
  // CHANGE
  // const cabins = [];
  // const cabins = await getCabins()
  const filter = searchParams?.capacity ?? "all"

  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">
        Our Luxury Cabins
      </h1>
      <p className="text-primary-200 text-lg mb-10">
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature&apos;s beauty in your own little home
        away from home. The perfect spot for a peaceful, calm vacation. Welcome
        to paradise.
      </p>
 
      <div className="flex justify-end mb-8">
        <Filter filter={filter} />
      </div>

        <Suspense fallback={<Spinner />} key={filter}>
          <CabinList filter={filter} />
          <ReservationReminder />
        </Suspense>
    
    </div>
  );
}

