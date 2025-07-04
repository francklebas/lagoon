<template>
  <div class="landing">
    <div class="container">
      <header>
        <h1>Lagoon</h1>
        <p class="tagline">Your Markdown editor. Minimal. Local. Free.</p>
      </header>

      <main>
        <div class="hero">
          <strong>Write</strong>. <strong>Preview</strong>. <strong>Version</strong>.<br>
          No account. No cloud. No tracking.
        </div>

        <section class="features">
          <div class="feature">
            <span class="feature-icon">✍️</span>
            <div class="feature-content">
              <h3>Real-time Markdown editing</h3>
              <p>Clean interface with instant preview. Focus on what matters: your ideas.</p>
            </div>
          </div>

          <div class="feature">
            <span class="feature-icon">🗂️</span>
            <div class="feature-content">
              <h3>Local versioned storage</h3>
              <p>Built-in Git in your browser. Complete history, easy restore, ZIP export.</p>
            </div>
          </div>

          <div class="feature">
            <span class="feature-icon">🔒</span>
            <div class="feature-content">
              <h3>Zero hosting, zero dependencies</h3>
              <p>Your notes stay in your browser. No connection, no account. Your data belongs to you.</p>
            </div>
          </div>
        </section>

        <div class="cta">
          <router-link to="/editor" class="cta-primary">
            👉 Access Lagoon
          </router-link>
          
          <div class="cta-secondary">
            <a href="mailto:francklebas@ik.me">
              💬 Give feedback
            </a>
            <a href="https://paypal.me/flebas13?country.x=FR&locale.x=fr_FR">
              ☕ Support via PayPal
            </a>
          </div>
        </div>
      </main>

      <footer>
        <p>Lagoon – An open source project created with passion</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: white;
  color: var(--dark, #1a1a1a);
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  padding: 4rem 0;
}

h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.tagline {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.hero {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 3rem 0;
  text-align: center;
  line-height: 1.8;
}

.hero strong {
  font-weight: 600;
  color: var(--primary, #0066cc);
}

.features {
  display: grid;
  gap: 2rem;
  margin: 4rem 0;
  padding: 3rem;
  background: var(--light, #f5f5f5);
  border-radius: 12px;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-content h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.feature-content p {
  color: #666;
}

.cta {
  text-align: center;
  margin: 4rem 0;
  padding: 3rem 0;
}

.cta-primary {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: var(--primary, #0066cc);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 2rem;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 102, 204, 0.2);
}

.cta-secondary {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1rem;
}

.cta-secondary a {
  color: var(--primary, #0066cc);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}

.cta-secondary a:hover {
  opacity: 0.8;
}

footer {
  text-align: center;
  padding: 3rem 0;
  color: #999;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }

  .features {
    padding: 2rem 1.5rem;
  }

  .cta-secondary {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .landing {
    background: #0a0a0a;
    color: #e0e0e0;
  }

  .tagline, .feature-content p {
    color: #999;
  }

  .features {
    background: #1a1a1a;
  }

  .hero strong {
    color: #4fc1ff;
  }

  .cta-primary {
    background: #4fc1ff;
    color: #0a0a0a;
  }

  .cta-secondary a {
    color: #4fc1ff;
  }
}
</style>