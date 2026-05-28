import { useEffect, useState } from "react";
import { apiRequest } from "./api";

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    blog: "",
    date: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(accessToken);

  useEffect(() => {
    if (isLoggedIn) {
      fetchBlogs();
    }
  }, [isLoggedIn]);

  async function fetchBlogs() {
    try {
      setError("");
      const data = await apiRequest("/blog/");
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (authMode === "register") {
        await apiRequest("/auth/register/", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });

        setMessage("Account created. Please login now.");
        setAuthMode("login");
        setPassword("");
        return;
      }

      const data = await apiRequest("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("user", JSON.stringify(data.user));

      setAccessToken(data.access);
      setUser(data.user);
      setUsername("");
      setPassword("");
      setMessage("Logged in successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
    setBlogs([]);
    setMessage("Logged out.");
  }

  function handleFormChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleBlogSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (editingId) {
        await apiRequest(`/blog/${editingId}/`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });

        setMessage("Blog updated.");
      } else {
        await apiRequest("/blog/", {
          method: "POST",
          body: JSON.stringify(form),
        });

        setMessage("Blog created.");
      }

      setForm({
        title: "",
        blog: "",
        date: "",
      });
      setEditingId(null);
      fetchBlogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(blog) {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      blog: blog.blog,
      date: blog.date,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      blog: "",
      date: "",
    });
  }

  async function deleteBlog(id) {
    const confirmed = window.confirm("Delete this blog?");
    if (!confirmed) return;

    try {
      setError("");
      await apiRequest(`/blog/${id}/`, {
        method: "DELETE",
      });

      setMessage("Blog deleted.");
      fetchBlogs();
    } catch (err) {
      setError(err.message);
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Django Blog</h1>
          <p>React frontend for your Django REST API</p>
        </div>

        {isLoggedIn && (
          <div className="user-box">
            <span>Hello, {user?.username}</span>
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        )}
      </header>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {!isLoggedIn ? (
        <main className="auth-page">
          <form className="card auth-card" onSubmit={handleAuthSubmit}>
            <h2>{authMode === "login" ? "Login" : "Register"}</h2>

            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Please wait..." : authMode === "login" ? "Login" : "Register"}
            </button>

            <p className="switch-text">
              {authMode === "login" ? "No account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setError("");
                  setMessage("");
                }}
              >
                {authMode === "login" ? "Register" : "Login"}
              </button>
            </p>
          </form>
        </main>
      ) : (
        <main className="dashboard">
          <section className="card form-card">
            <h2>{editingId ? "Edit Blog" : "Create Blog"}</h2>

            <form onSubmit={handleBlogSubmit}>
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Blog title"
                maxLength="150"
                required
              />

              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                required
              />

              <label>Blog</label>
              <textarea
                name="blog"
                value={form.blog}
                onChange={handleFormChange}
                placeholder="Write your blog..."
                rows="7"
                required
              />

              <div className="button-row">
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Blog" : "Create Blog"}
                </button>

                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="blog-section">
            <div className="section-title">
              <h2>All Blogs</h2>
              <button className="btn btn-secondary" onClick={fetchBlogs}>
                Refresh
              </button>
            </div>

            {sortedBlogs.length === 0 ? (
              <div className="empty">No blogs yet. Create your first blog.</div>
            ) : (
              <div className="blog-grid">
                {sortedBlogs.map((item) => (
                  <article className="card blog-card" key={item.id}>
                    <div className="blog-date">{item.date}</div>
                    <h3>{item.title}</h3>
                    <p>{item.blog}</p>

                    <div className="blog-actions">
                      <button className="btn btn-secondary" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => deleteBlog(item.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;