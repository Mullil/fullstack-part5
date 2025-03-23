import { useState } from 'react'

const BlogForm = ({ createBlog, setNotification }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await createBlog({ title: title, author: author, url: url })
      setNotification(`a new blog ${title} by ${author} added`)
      setTimeout(() => {
        setNotification(null)
      }, 5000)
      setTitle('')
      setAuthor('')
      setUrl('')
    } catch (error) {
      console.log(error)
      setNotification(error.response.data.error)
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }
  return (
    <div>
      <h2>
        create new
      </h2>
      <form onSubmit={handleSubmit}>
        <p>title: <input data-testid='title' type="text" value={title} onChange={({ target }) => setTitle(target.value)} placeholder='title'></input></p>
        <p>author: <input data-testid='author' type="text" value={author} onChange={({ target }) => setAuthor(target.value)} placeholder='author'></input></p>
        <p>url: <input data-testid='url' type="text" value={url} onChange={({ target }) => setUrl(target.value)} placeholder='url'></input></p>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm