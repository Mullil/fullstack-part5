const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body.blogObject
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }
  console.log(body)
  const blog = new Blog({
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  const savedBlog = await blog.save()
  const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.json(populatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const id = request.params.id
  const user = request.user
  const blog = await Blog.findById(id)
  console.log(blog)
  if ( blog.user.toString() === user.id.toString() ) {
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
  }
  else {
    return response.status(401).json({ error: 'token invalid' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes,
    user: body.user.id
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .populate('user', { name: 1, username: 1 })
  console.log(updatedBlog)
  response.json(updatedBlog)
})

module.exports = blogsRouter