var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs
    .map(blog => blog.likes)
    .reduce((likes, currentValue) => likes + currentValue,
      0,
    )
}

const favoriteBlog = (blogs) => {
  const maxLikes =  _.maxBy(blogs, 'likes')
  return { title: maxLikes.title, author: maxLikes.author, likes: maxLikes.likes }
}

const mostBlogs = (blogs) => {
  const blogCount = _.countBy(blogs, 'author')
  const authors = _.map(blogCount, (count, author) => ({ author, blogs: count }))
  return _.maxBy(authors, 'blogs')
}

const mostLikes = (blogs) => {
  const authorLikes = blogs.reduce((result, blog) => {
    result[blog.author] = (result[blog.author] || 0) + blog.likes
    return result
  }, {})
  const authors = _.map(authorLikes, (likes, author) => ({ author, likes }))
  return _.maxBy(authors, 'likes')
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}