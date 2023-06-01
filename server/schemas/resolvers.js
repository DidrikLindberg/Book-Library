const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query:{
        me: async(parents,args,context) =>{
            if(context.user){
                const foundUser = await User.findOne({
                    $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
                  });
              
                return foundUser
            }
            throw new AuthenticationError('You need to be logged in')
        }
    },
    Mutation: {
        login: async(parent, {email, password}) =>{
            const user = await User.findOne({email})

            if(!user){
                throw new AuthenticationError("Incorrect credentials ")
            }
            const correctPw = await user.isCorrectPassword(password)
            if(!correctPw){
                throw new AuthenticationError("Incorrect credentials ")
            }

            const token = signToken(user)

            return{token, user}
        },
        addUser: async(parent, args) =>{
            const user = await User.create(args)
            const token = signToken(user);
            return{token, user}
        },
        // {authors, description, title,bookID, image, link}
        saveBook: async(parent,args, context) =>{
            if(context.user){
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args } },
                    { new: true, runValidators: true }
                  );
                  return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in')

        },
        removeBook: async(parent, {bookId}, context) => {
            if(context.user){
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                )
                    return updatedUser
            }
            throw new AuthenticationError('You need to be logged in')
        }
    }
}