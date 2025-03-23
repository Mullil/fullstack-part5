const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const helper = require('./test_helper.js')

const Blog = require('../models/blog')


describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.blogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.blogs.length)
  })

  test('all identifiers are named id', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.every(blog => 'id' in blog && !('_id' in blog)), true)
  })
})

describe('adding blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.blogs)
  })
  test('length of blogs increases by one', async () => {
    const newBlog = {
      title: 'testblog',
      author: 'tester',
      url: 'testurl',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.blogs.length +1)
  })

  test('default likes is zero', async () => {
    const newBlog = {
      title: 'anothertest',
      author: 'tester',
      url: 'testurl2'
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
  })

  test('fails with status code 400 if data is invalid', async () => {
    const newBlog1 = {
      author: 'tester',
      url: 'testurl3'
    }

    await api
      .post('/api/blogs')
      .send(newBlog1)
      .expect(400)

    const newBlog2 = {
      title: 'testing',
      author: 'tester'
    }

    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.blogs.length)
  })
})

describe('deleting blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.blogs)
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const blogs = await helper.blogsInDb()
    const deletedBlog = blogs[0]
    await api
      .delete(`/api/blogs/${deletedBlog.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogs.length - 1)
  })
})

describe('editing blogs', () => {
  test('the number of likes can be updated', async () => {
    const blogs = await helper.blogsInDb()
    const blogToEdit = blogs[0]
    const newBlog = {
      author: blogToEdit.author,
      title: blogToEdit.title,
      url: blogToEdit.url,
      likes: blogToEdit.likes + 1
    }

    await api
      .put(`/api/blogs/${blogToEdit.id}`)
      .send(newBlog)
      .expect(200)

    const editedBlog = await Blog.findById(blogToEdit.id)
    assert.strictEqual(editedBlog.likes, newBlog.likes)
  })
})

after(async () => {
  await mongoose.connection.close()
})