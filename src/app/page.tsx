"use client"

import Link from "next/link";
import React from 'react';


export default function Home() {
  return (<div>

    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <header className="w-full py-4 bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold text-blue-600">VidLive</h1>
          <nav className="flex space-x-4">
            <Link href="/sign-in"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-100">
              Sign In

            </Link>
            <Link href="/sign-up"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
              Sign Up

            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto flex flex-col items-center text-center px-4">
        <h2 className="text-4xl font-extrabold text-gray-900 mt-10">
          Welcome to <span className="text-blue-600">VidLive</span>
        </h2>
        <p className="text-lg text-gray-700 mt-4">
          Connect with anyone, anywhere, instantly. Real-time video chat made simple and fast.
        </p>
        <div className="mt-8">
          <Link href="/sign-up"
            className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700">
            Get Started

          </Link>
        </div>
       
      </main>

      <footer className="w-full py-4 bg-gray-100">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} VidLive. All rights reserved.
        </div>
      </footer>
    </div>
  </div>


  );
}

