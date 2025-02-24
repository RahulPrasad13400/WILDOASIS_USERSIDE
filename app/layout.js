import Header from "./_components/Header";
import Logo from "./_components/Logo";
import Navigation from "./_components/Navigation";

import '@/app/_styles/globals.css'
// importing fonts 
import {Josefin_Sans} from "next/font/google"
import { ReservationProvider } from "./_components/ReservationContext";
const josefin = Josefin_Sans({
  subsets : ['latin'],
  display : "swap"
})

export const metadata = {
  // title : "The Wild Oasis"
  title : {
    template : "%s : The Wild Oasis",
    default : "Welcome / The Wild Oasid"
  },
  description : "Luxurious cabin hotel, located in the heart of the Italian Dolomites, surrounded by beautiful mountains and dark forests"
}


// we can give what ever name as we wish but the convention is calling it as RootLayout 
// it only require the html and body, head is not required 
export default function RootLayout({children}){
  return <html> 
    <body className={`${josefin.className} bg-primary-950 text-primary-100 min-h-screen flex flex-col relative`}>
        <Header />
        <div className="flex-1 px-8 py-12 grid">
        <main className="max-w-7xl mx-auto w-full">
          <ReservationProvider>
            {children}
          </ReservationProvider>
        </main>
        </div>
        {/* <footer>
          Copyright by The Wild Oasis
        </footer> */}
    </body>
  </html>
}