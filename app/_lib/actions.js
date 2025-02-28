"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBooking } from "./data-service";
import { redirect } from "next/navigation";

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
    // Authentication
    const session = await auth()
    if(!session) throw new Error("You must be logged in!")
    // Authorization
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


export async function updateBooking(formData){
    
    const bookingId = Number(formData.get('bookingId'))

    // Authentication
    const session = await auth()
    if(!session) throw new Error("You must be logged in!")
    // Authorization 
    const guestBookings = await getBooking(session.user.guestId)
    const guestBookingIds = guestBookings.map((booking)=>booking.id)

    if(!guestBookingIds.includes(bookingId)){
        throw new Error("You are not allowed to update this booking")
    }

    const updateData = {
        numGuests : Number(formData.get('numGuests')),
        observations : formData.get('observations').slice(0, 100),
    }

    const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single();

    if (error) {
        console.error(error);
        throw new Error('Booking could not be updated');
    }

    // Revalidation
    revalidatePath(`/account/reservations/edit/${bookingId}`)
    revalidatePath('/account/reservations')

    // Redirecting 
    redirect('/account/reservations')
}

export async function createBooking(bookingData, formData){
    // Authentication
        const session = await auth()
        if(!session) throw new Error("You must be logged in!")
        
        const newBooking = {
            ...bookingData,
            guestId : session.user.guestId,
            numGuests : Number(formData.get('numGuests')),
            observations : formData.get('observations').slice(0, 1000),
            extrasPrice : 0,
            totalPrice : bookingData.cabinPrice,
            isPaid : false,
            hasBreakfast : false,
            status : 'unconfirmed',

        }

        const { error } = await supabase
        .from('bookings')
        .insert([newBooking])
    
        if (error) {
            console.error(error);
            throw new Error('Booking could not be created');
        }

        revalidatePath(`/cabins/${bookingData.cabinId}`)
        
        redirect('/cabins/thankyou')

}