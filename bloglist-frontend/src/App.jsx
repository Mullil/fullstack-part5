import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'


const Notification = ({ notification }) => {
  const notificationStyle = {
    background: 'lightgrey',
    fontSize: 16,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  if (notification === null) {
    return null
  }
  return (
    <div style={notificationStyle}>{notification}</div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const [loginVisible, setLoginVisible] = useState(true)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)
    try {
      const user = await loginService.login({
        username, password
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setNotification('wrong username or password')
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  const handleLogout = async (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    setUsername('')
    setPassword('')
  }

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>login</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
    )
  }

  const logoutForm = () => (
    <form onSubmit={handleLogout}>
      <button type="submit" data-testid="logout-button">logout</button>
    </form>
  )

  const addBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility()
    const createdBlog = await blogService.create({ blogObject })
    console.log(createdBlog)
    setBlogs(blogs.concat(createdBlog))
  }

  const updateBlog = async (blogObject) => {
    const updatedBlog = await blogService.update(blogObject)
    setBlogs(blogs.map(blog => blog.id === updatedBlog.id ? updatedBlog : blog))
  }

  const blogForm = () => {
    return (
      <>
        <Togglable buttonLabel='new blog' ref={blogFormRef}>
          <BlogForm createBlog={addBlog} setNotification={setNotification}></BlogForm>
        </Togglable>
        <div>
          <h2>blogs</h2>
          {blogs.sort((a, b) => b.likes - a.likes).map(blog =>
            <Blog key={blog.id} blog={blog} blogs={blogs} updateBlog={updateBlog} user={user} setBlogs={setBlogs}/>
          )}
        </div>
      </>
    )
  }

  return (
    <div>
      <Notification notification={notification}></Notification>
      {!user && loginForm()}
      {user && <div>
        <p>{user.name} is logged in</p>
        {logoutForm()}
        {blogForm()}
      </div>
      }
    </div>
  )
}

export default App