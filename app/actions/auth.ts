'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password');
  const adminPassword = process.env.APP_PASSWORD;
  const officePassword = process.env.OFFICE_PASSWORD;

  if (password === adminPassword || password === officePassword) {
    // Await the cookie store before setting the cookie
    const cookieStore = await cookies();
    
    cookieStore.set('medcoor_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, 
      path: '/',
    });
    
    redirect('/');
  } else {
    return { error: 'Incorrect password. Please try again.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('medcoor_auth');
  redirect('/login');
}