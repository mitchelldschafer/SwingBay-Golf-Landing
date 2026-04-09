import React from 'react';
import BookingWidget from '../components/BookingWidget';

const Book = () => {
  return (
    <div className="py-20 px-6 bg-[var(--background)] min-h-[80vh] flex flex-col justify-center">
      <BookingWidget />
    </div>
  );
};

export default Book;
