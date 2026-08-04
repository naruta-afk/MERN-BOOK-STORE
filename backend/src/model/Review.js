const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// One review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Recalculate book's average rating after save/remove
reviewSchema.statics.recalculateBookRating = async function (bookId) {
  const Book = mongoose.model('Book');
  const stats = await this.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Book.findByIdAndUpdate(bookId, {
    rating: stats[0]?.avgRating || 0,
    numReviews: stats[0]?.count || 0,
  });
};

reviewSchema.post('save', function () {
  this.constructor.recalculateBookRating(this.book);
});

module.exports = mongoose.model('Review', reviewSchema);