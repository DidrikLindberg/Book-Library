const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

module.exports = {
  Query: {
    user: async (_, { id }, { user }) => {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : id }],
      });

      if (!foundUser) {
        throw new Error('Cannot find a user with this id!');
      }

      return foundUser;
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const user = await User.create(input);

      if (!user) {
        throw new Error('Something is wrong!');
      }

      const token = signToken(user);

      return { token, user };
    },
    login: async (_, { input }) => {
      const { username, email, password } = input;
      const user = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (_, { input }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error('Error saving the book.');
      }
    },
    deleteBook: async (_, { bookId }, { user }) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }

      return updatedUser;
    },
  },
};
