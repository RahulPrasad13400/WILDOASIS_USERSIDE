"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBooking } from "./data-service";

export async function signInAction(){
    await signIn('google', {redirectTo : "/account"})
}

export async function signOutAction(){
    await signOut({redirectTo : "/"})
}

// it is a common practise in server action not to use  a try catch 
export async function updateGuest(formData){
    const session = await auth()
    if(!session){
        throw new Error("you must be logged in")
    }

    const nationalID = formData.get('nationalID')
    const [nationality, countryFlag] = formData.get('nationality').split('%')

    // const regex = /^[a-zA-Z0-9]{6,12}$/;
    // const isValid = regex.test(nationalID);

    if(!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)){
        throw new Error("please provide a valid national Id")
    }

    const updateData = {
        nationality,
        countryFlag,
        nationalID
    }

    const { data, error } = await supabase
    .from('guests')
    .update(updateData)
    .eq('id', session.user.guestId)

    if (error) {
        console.error(error);
        throw new Error('Guest could not be updated');
    }
  
    revalidatePath('/account/profile')

}

export async function deleteReservation(bookingId){
    const session = await auth()
    if(!session) throw new Error("You must be logged in!")

    const guestBookings = await getBooking(session.user.guestId)
    const guestBookingIds = guestBookings.map((booking)=>booking.id)

    if(!guestBookingIds.includes(bookingId)){
        throw new Error("You are not allowed to delete this booking")
    }
    
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) {
      console.error(error);
      throw new Error('Booking could not be deleted');
    }

    revalidatePath('/account/reservations')
}