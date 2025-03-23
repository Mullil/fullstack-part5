const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const helper = require('./test_helper.js')

const User = require('../models/user')


describe('adding a user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })
  test.only('adding a too short username fails with status code 400', async () => {
    const tooShort =   {
      _id: '5a422bc61b54a676234d17fd',
      username: 'ab',
      name: 'tooShortUsername',
      password: 'validPassword'
    }
    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users')
      .send(tooShort)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('adding a non-unique username fails with status code 400', async () => {
    const initialUser = {
      _id: '5a422bc61b54a676234d17fm',
      username: 'username',
      name: 'unique',
      password: 'validPassword'
    }
    await api
      .post('/api/users')
      .send(initialUser)
      .expect(201)

    const nonUnique =   {
      _id: '5a422bc61b54a676234d17ff',
      username: 'username',
      name: 'notUnique',
      password: 'validPassword'
    }
    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users')
      .send(nonUnique)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('adding a too short password fails with status code 400', async () => {
    const shortPassword =   {
      _id: '5a422bc61b54a676234d17fe',
      username: 'validUsername',
      name: 'tooShortPassword',
      password: 'a'
    }
    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users')
      .send(shortPassword)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('adding a user without a username fails with status code 400', async () => {
    const noUsername = {
      _id: '5a422bc61b54a676234d17fp',
      name: 'name',
      password: 'validPassword'
    }

    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users')
      .send(noUsername)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('adding a user without a password fails with status code 400', async () => {
    const noPassword = {
      _id: '5a422bc61b54a676234d17fp',
      username: 'abcdefg',
      name: 'name',
    }

    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users')
      .send(noPassword)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})