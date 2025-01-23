import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getProfileRoleIfCreated, isPatientRegistered, isDoctorRegistered } from './lib/actions/user.actions';
import { isRedirectError } from 'next/dist/client/components/redirect';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone(); // Clone the URL object for redirection
  if (url.pathname === '/login' || url.pathname === '/') {
    return NextResponse.next(); // Continue to the next middleware if the route is login
  }
  let isRedirectRequest = (url.pathname === '/redirect');

  const profileRole = await getProfileRoleIfCreated(); // Get the user's profile role
  // Handle route protection for Patients and Doctors
  if (profileRole === 'Patient') {
    if (!isRedirectRequest && !url.pathname.startsWith('/patient')) {
      // If non-doctor tries to access any Doctor-related page, redirect to home
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    const patient = await isPatientRegistered();
    if (patient) {
      url.pathname = '/patient/dashboard'; // Redirect to Patient Dashboard if registered
    } else {
      url.pathname = '/patient/register'; // Redirect to Patient Registration
    }
  } else if (profileRole === 'Doctor') {
    if (!isRedirectRequest && !url.pathname.startsWith('/doctor')) {
      // If a non-patient tries to access any Patient-related page, redirect to home
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    const doctor = await isDoctorRegistered();
    if (doctor) {
      url.pathname = '/doctor/dashboard-new'; // Redirect to Doctor's main page if registered
    } else {
      url.pathname = '/doctor/register'; // Redirect to Doctor Register
    }
  } else if (profileRole === 'No Role') {
    url.pathname = '/profile/create'; // Redirect for users with no role
  } else {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }


  if (url.pathname === request.nextUrl.pathname) {
    return NextResponse.next(); // Continue to the next middleware if no redirection is needed
  }

  return NextResponse.redirect(url); // Perform the redirection
}

// Middleware matcher to apply role-based routing
export const config = {
  matcher: [
    // Match all paths except for these (static files, images, etc.)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
