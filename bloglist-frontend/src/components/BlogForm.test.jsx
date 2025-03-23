import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('form calls the callback function when blog is created', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()
  const setNotification = vi.fn()

  render(<BlogForm createBlog={createBlog} setNotification={setNotification} />)

  const title = screen.getByPlaceholderText('title')
  const author = screen.getByPlaceholderText('author')
  const url = screen.getByPlaceholderText('url')

  const sendButton = screen.getByText('create')

  await userEvent.type(title, 'testing a title' )
  await userEvent.type(author, 'testing author' )
  await userEvent.type(url, 'testing url' )
  await userEvent.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog).toHaveBeenCalledWith({
    title: 'testing a title',
    author: 'testing author',
    url: 'testing url'
  })
})