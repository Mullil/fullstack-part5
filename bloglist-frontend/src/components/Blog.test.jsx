import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'

test('renders content', () => {
  const blog = {
    title: "testTitle",
    author: "testAuthor",
    url: "testUrl",
    likes: 10930,
  }

  render(<Blog blog={blog} />)
  const title = screen.getByText('testTitle', { exact: false })
  expect(title).toBeDefined()
  const author = screen.getByText('testAuthor', { exact: false })
  expect(author).toBeDefined()

})

test('does not render url or likes by default', () => {
  const blog = {
    title: "testTitle",
    author: "testAuthor",
    url: "testUrl",
    likes: 10233
  }

  render(<Blog blog={blog} />)

  const url = screen.queryByText('testUrl')
  expect(url).toBeNull()
  const title = screen.queryByText('testTitle')
  expect(title).toBeNull()
})

test('url and likes are shown, when button is pressed', async () => {
  const user = userEvent.setup()
  const blog = {
    title: "testTitle",
    author: "testAuthor",
    url: "testUrl",
    likes: 10233,
    user: {
      id: "123",
      name: "testUser",
      username: "testusername"
    }
  }
  const testUser = {
    id: "123"
  }

  render(<Blog blog={blog} user={testUser}/>)
  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  const url = screen.getByText('testUrl', { exact: false })
  expect(url).toBeDefined()
  const likes = screen.getByText('likes 10233', { exact: false })
  expect(likes).toBeDefined()
  screen.debug()
})

test('calls event handler two times when like button is clicked', async () => {
  const user = userEvent.setup()
  const blog = {
    title: "testTitle",
    author: "testAuthor",
    url: "testUrl",
    likes: 10233,
    user: {
      id: "123",
      name: "testUser",
      username: "testusername"
    }
  }
  const testUser = {
    id: "123"
  }
  const updateBlog = vi.fn()
  render(<Blog blog={blog} user={testUser} updateBlog={updateBlog}/>)
  const viewButton = screen.getByText('view')
  await user.click(viewButton)
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)
  expect(updateBlog).toHaveBeenCalledTimes(2)
})