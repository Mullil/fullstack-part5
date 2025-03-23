import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlog, blogs, user, setBlogs }) => {
  console.log(user.id)
  console.log(blog)
  const [blogVisible, setBlogVisible] = useState(false)
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const handleRemove = async () => {
    if (window.confirm(`Remove blog ${blog.title}`)) {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
    }
  }

  const removeButton = () => (
    <button onClick={handleRemove}>remove</button>
  )


  const handleLike = async () => {
    const newBlog = {
      id: blog.id,
      author: blog.author,
      title: blog.title,
      url: blog.url,
      likes: blog.likes + 1,
      user: {
        id: blog.user.id,
        name: blog.user.name,
        username: blog.user.username
      }
    }
    await updateBlog(newBlog)
    }

  const blogInfo = () => (
    <>
      <p>{blog.url}</p>
      <p data-testid="like-count">likes {blog.likes}</p> <button data-testid="like-button" onClick={handleLike}>like</button>
      <p>{blog.user.name}</p>
      {blog.user.id === user.id && removeButton()}
    </>
  )
  return (
    <li className='blog'>
      <div style={blogStyle}>
        <div>
          {blog.title} {blog.author} <button data-testid="view-button" onClick={() => setBlogVisible(!blogVisible)}>{blogVisible ? 'hide' : 'view'}</button>
        </div>
        {blogVisible && blogInfo()}
      </div>
    </li>
  )}

export default Blog